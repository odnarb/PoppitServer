// require('newrelic');

/*
*
* Server for app dashboard
*
*/

//get the args starting at position 2 (node app.js --port 3000)
const args = require('minimist')(process.argv.slice(2));

//load env vars from .env file
require('dotenv').config();

//get the log level, depending on what's passed
const level = { loglevel: process.env.LOG_LEVEL || 'debug' };

const
    globals = require('./lib/globals.js')(level),
    express = require('express'),
    _ = require('lodash'),
    mysql = require('mysql'),
    moment = require('moment'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    csrf = require('csurf'),
    events = require('events'),
    bcrypt = require('bcrypt'),
    favicon = require('serve-favicon'),
    path = require('path'),
    uuid = require('uuid'),
    expressLayouts = require('express-ejs-layouts');

const app = express();
const eventEmitter = new events.EventEmitter();
const router = express.Router();

//setup redis
const redis = require('redis');
let redisStore = require('connect-redis')(session);
let redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});

//////////////////////////////////////////////////////////////////
// MYSQL CONFIG
//////////////////////////////////////////////////////////////////

let connection = mysql.createConnection({
    host     :  process.env.DB_HOST,
    user     :  process.env.DB_USER,
    password :  process.env.DB_PASS,
    database :  process.env.DB_NAME,
    multipleStatements: true
});

connection.connect( (err) => {
    if (err) {
        globals.logger.error('error connecting to DB: ' + err.stack);
        return;
    }

    // examples of log output at different levels..
    // globals.logger.silly("127.0.0.1 - there's no place like home");
    // globals.logger.debug( "127.0.0.1 - there's no place like home");
    // globals.logger.verbose( "127.0.0.1 - there's no place like home");
    // globals.logger.info( "127.0.0.1 - there's no place like home");
    // globals.logger.warn( "127.0.0.1 - there's no place like home");
    // globals.logger.error("127.0.0.1 - there's no place like home", { test: 123, blah: () => { return "test"} });

    globals.logger.info( 'DB connected as id ' + connection.threadId );

    //set a global for the db connection
    globals.db = connection;

    //continue to start the server
    eventEmitter.emit('mysqlReady');
});

connection.on('error', (err) => {
    logger.error("DB ERROR: ", err)
    if(err.code === "PROTOCOL_CONNECTION_LOST"){
        logger.error("Terminating process...")
        process.exit(-1)
    }
});

//////////////////////////////////////////////////////////////////
// EXPRESS SETUP
//////////////////////////////////////////////////////////////////
//Setup router configuration

////////////////////////////////////////////
////    EXPRESS MIDDLEWARE & OPTIONS    ////
////////////////////////////////////////////

//create the logger for routes
app.set('logger', globals.logger);

//disable powered by header
app.set('x-powered-by', false);

// set the view engine to ejs
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layout.ejs');

//where are the static assets?
    //I've tested this and if an asset exists, the file is served directly
    // without any policies being applied, but if it does not, the asset request
    // flows next through the policy chain and routes
app.use(express.static( path.join(__dirname, "public" )));

//set the favicon
app.use(favicon(path.join(__dirname, 'public', process.env.APP_FAVICON )))

// Ensures that the content-type for SNS messages
app.use(function(req, res, next) {
    if (req.get("x-amz-sns-message-type")) {
      req.headers["content-type"] = "application/json"; //IMPORTANT, otherwise content-type is text for topic confirmation reponse, and body is empty
    }
    next();
});

//Don't need to do parsing just yet..
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

let redis_config = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    client: redisClient
    // ttl: process.env.REDIS_TTL
};

app.use(cookieParser());
// //csrf options
const csrfMiddleware = csrf({
    cookie: true
});
app.use(csrfMiddleware);

//setup session
const session_secret = "fdsk4f7b787fdslgf890-fsdf9f-fd888vcx89fs"
app.use(session({
    genid: (req) => {
        return uuid.v4();
    },
    //always use a secure secret, not something committed to the repo
    secret: `${session_secret}`,

    //i.e. "sess_foobar" is the cookie name
    name: `_${process.env.APP_NAME.toLowerCase()}`,

    //probably a good thing to set to true for PROD
    resave: false,

    //probably leave to true
    saveUninitialized: true,
    cookie: {
        secure: false, // this should be set to true for SSL
              // m *  s * ms
        maxAge:  5 * 60 * 1000
    },
    store: new redisStore(redis_config)
}));

//apply our router function to ALL methods defined in router
let mainPolicy = require('./policies/main.js')(globals);
app.use(mainPolicy);

let loadResLocalsPolicy = require('./policies/loadResLocals.js')(globals);
app.use(loadResLocalsPolicy);

//set some local variables to boot, so routes and views can access
app.use( (req,res,next) => {
    res.locals.appName = process.env.APP_NAME;
    res.locals.url = req.url;
    res.locals._csrf = req.csrfToken();

    if( res.locals.error_status == undefined ){
        res.locals.error_status = ''
    }
    if( res.locals.user === undefined ){
        res.locals.user = {}
    }
    if( req.session.isLoggedIn ){
        res.locals.user = req.session.user;
    }
    if( req.session.user_context && req.session.user_context.id > 0 ){
        res.locals.user_context = req.session.user_context;
    } else {
        res.locals.user_context = undefined;
    }
    next();
});

////////////////////////////////////////////////////////
// APP ROUTER
////////////////////////////////////////////////////////

let main = require('./routes/main.js')(globals);
app.use('/', main);

let admin = require('./routes/admin.js')(globals);
app.use('/admin', admin);

let profile = require('./routes/profile.js')(globals);
app.use('/profile', profile);

let user = require('./routes/user.js')(globals);
app.use('/user', user);

let companies = require('./routes/companies.js')(globals);
app.use('/companies', companies);

let campaigns = require('./routes/campaigns.js')(globals);
app.use('/campaigns', campaigns);

// let appuser = require('./routes/appuser.js')(globals);
// app.use('/appuser', appuser);

// let locations = require('./routes/locations.js')(globals);
// app.use('/locations', locations);

//handle 404's
app.use( (req, res, next) => {
    globals.logger.info("ERROR 404 :: requested url: " + req.url );

    if( req.xhr ) {
        return res.json({ status_code: res.status, status: "error", err_msg: "Not found" });
    } else if ( globals.isStaticRequest( req.url ) ) {
        return res.send("Not Found")
    } else {
        let error_layout = (req.session.user && req.session.user.id > 0)? 'layout' : 'login_layout'

        //for the error handler, we need to set the variable in res.locals
        return res.render('errors/404.ejs', {
            pageTitle: `Not Found`,
            error_status: 404,
            layout: error_layout
        });
    } //end if(req.xhr)
});


//error handler
let errorHandler = require('./policies/errorHandler.js')(globals);
app.use(errorHandler);

//apply the router
app.use(router);

//////////////////////////////////////////////////////////////////
// START EXPRESS SERVER
//////////////////////////////////////////////////////////////////

//First wait for mysql connection
eventEmitter.on('mysqlReady', () => {
    // Now start Waterline passing adapters in

    // Start Server
    let port = args.port || 3000;
    app.listen(port);
    globals.logger.info(`${process.env.APP_NAME} Server is LIVE on port ${port}`);
});
