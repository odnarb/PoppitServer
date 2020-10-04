/*
*
* Server for Poppit dashboard
*
*/

//get the args starting at position 2 (node app.js --port 3000)
const args = require('minimist')(process.argv.slice(2));

//get the log level, depending on what's passed
let level = { loglevel: args.loglevel || 'debug' };

const
    globals = require('./lib/globals.js')(level),
    express = require('express'),
    dotenv = require('dotenv'),
    _ = require('lodash'),
    mysql = require('mysql'),
    moment = require('moment'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    events = require('events'),
    bcrypt = require('bcrypt'),
    favicon = require('serve-favicon'),
    path = require('path'),
    expressLayouts = require('express-ejs-layouts');

const app = express();
const eventEmitter = new events.EventEmitter();
const router = express.Router();

//load env vars from .env file
dotenv.config();

//setup redis
const redis = require('redis');
let redisStore = require('connect-redis')(session);
let redisClient = redis.createClient();

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

//////////////////////////////////////////////////////////////////
// EXPRESS SETUP
//////////////////////////////////////////////////////////////////
//Setup router configuration

//apply our router function to ALL methods defined in router
let policyFilter = require('./policies/main.js')(globals);
app.use(policyFilter, router);

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

//set some local variables to boot, so routes and views can access
app.use( (req,res,next) => {
    req.app.locals.title = `POPPIT GAMES | `;
    req.app.locals.url = req.url;
    next();
});


//where are the static assets?
app.use(express.static('public'));

//set the favicon
app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.png')))

//Don't need to do parsing just yet..
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

let redis_config = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    client: redisClient,
    ttl: process.env.REDIS_TTL
};

//setup session
app.use(session({
    secret: 'fdsklgf890-gdf890-fsdf9f-fd888vcx89fsdgjaskjksdjksdkfjdsf',
    name: '_poppit',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: new redisStore(redis_config)
}));

////////////////////////////////////////////////////////
// APP ROUTER
////////////////////////////////////////////////////////

let main = require('./routes/main.js')(globals);
app.use('/', main);

let companyuser = require('./routes/companyuser.js')(globals);
app.use('/companyuser', companyuser);

let appuser = require('./routes/appuser.js')(globals);
app.use('/appuser', appuser);

let company = require('./routes/company.js')(globals);
app.use('/company', company);

//handle 404's
app.use( (req, res, next) => {
    globals.logger.info("ERROR 404 :: requested url: " + req.url );
    res.status(404).render('errors/404.ejs');
});

//error handler
let errorHandler = require('./policies/errorHandler.js')(globals);
app.use(errorHandler);

//////////////////////////////////////////////////////////////////
// START EXPRESS SERVER
//////////////////////////////////////////////////////////////////

//First wait for mysql connection
eventEmitter.on('mysqlReady', () => {
    // Now start Waterline passing adapters in

    // Start Server
    let port = args.port || 7777;
    app.listen(port);
    globals.logger.info(`Poppit Server is LIVE on port ${port}`);
});
