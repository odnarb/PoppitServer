/*
*
* Server for Poppit dashboard
*
*/

//get the local file
const dotenv = require('dotenv');

//get the args starting at position 2 (node app.js --port 3000)
const args = require('minimist')(process.argv.slice(2));

//get the globals
const globals = require('./lib/globals.js');

//load env vars from .env file
dotenv.config();

const express = require('express'),
    _ = require('lodash'),
    mysql = require('mysql'),
    moment = require('moment'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    events = require('events'),
    bcrypt = require('bcrypt');

const app = express();
const eventEmitter = new events.EventEmitter();
const router = express.Router();

const COOKIE_MAX_AGE = 72 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;

//setup redis
const redis = require('redis');
let redisStore = require('connect-redis')(session);
let redisClient = redis.createClient();

let stringifyOrEmpty = (i) => {
    if(i == "") return "";
    var newStr = JSON.stringify(i);
    newStr = newStr.replace(/'/g, "\'\'");
    return newStr;
};

//TODO
let sendEmail = (email, cb) => {
    console.log( globals.getTime() + " - TODO: Implement sendEmail()");
    cb();
};

//////////////////////////////////////////////////////////////////
// MYSQL CONFIG
//////////////////////////////////////////////////////////////////

let connection = mysql.createConnection({
    host     :  process.env.DB_HOST,
    user     :  process.env.DB_USER,
    password :  process.env.DB_PASS,
    database :  process.env.DB_NAME
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting to DB: ' + err.stack);
        return;
    }
    console.log( globals.getTime() + '---DB connected as id ' + connection.threadId) ;

    //set a global for the db connection
    app.set('db', connection );

    //access it later with: req.app.get('db').usercollection.find()


    //continue to start the server
    eventEmitter.emit('mysqlReady');

});

///THIS IS REFERENCED IN THE DBAL FILES BUT WE NEED TO EXTEND THE DBAL FUNCTIONS WITH THIS FUNCTION
let execSQL = (sqlStr, cb) => {
    console.log("SQL STRING: ", sqlStr);
    connection.query(sqlStr, function (error, result, fields) {
        if (error) {
            cb(error);
        } else {
            cb(null,result);
        }
    });
};

//////////////////////////////////////////////////////////////////
// EXPRESS SETUP
//////////////////////////////////////////////////////////////////
//Setup router configuration
const allowedMethods = ['GET', 'POST', 'HEAD', 'OPTIONS'];

//check https methods and whatnot
let policyFilter = (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
        return res.sendStatus(404);
    }

    //check session... show login or show dashboard
    if( req.url == '/' && !req.session.isLoggedIn ) {
        console.log( globals.getTime() + ' - : User NOT logged in..routing to login page' );
        return res.redirect('/user/login');
    }
    if( req.url == '/user/login' && req.session.isLoggedIn ) {
        console.log( globals.getTime() + ' - : User logged in..routing to dashboard' );
        return res.redirect('/');
    }
    return next();
};


////////////////////////////////////////////
////    EXPRESS MIDDLEWARE & OPTIONS    ////
////////////////////////////////////////////

//disable powered by header
app.set('x-powered-by', false);

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use((error, req, res, next) => {
    if (error) {
        return res.status(error.status).send(error.constructor.name);
    }
    return next();
});

//where are the static assets?
app.use(express.static('public'));

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

//apply our router function to ALL methods defined in router
app.use(policyFilter, router);

////////////////////////////////////////////////////////
// APP ROUTER
////////////////////////////////////////////////////////

//Hackers, nothing here to see, move along
router.post('/', (req, res, next) => {
    //just disable this..
    return res.sendStatus(404);
});

//This is the actual request we look for
router.get('/', (req, res) => {
    return res.render('pages/dashboard',{
        data: {
            pageTitle: process.env.APP_NAME + ' | Dashboard'
        }
    });
});

/// add routes here
let user = require('./routes/user.js');
app.use('/user', user);

let company = require('./routes/company.js');
app.use('/company', company);

//////////////////////////////////////////////////////////////////
// START EXPRESS SERVER
//////////////////////////////////////////////////////////////////

//First wait for mysql connection
eventEmitter.on('mysqlReady', () => {
    // Now start Waterline passing adapters in

    // Start Server
    let port = args.port || 7777;
    app.listen(port);
    console.log(globals.getTime() + '- Poppit Server is LIVE on port '+port);
});
