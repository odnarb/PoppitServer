/*
* Log mover service for Engage
* Takes log items from a redis db and moves to the SQL DB
* Created: 5/22/2018 by Brandon Chambers
*/

const dotenv = require('dotenv');

//load env vars from .env file
dotenv.config();

const COOKIE_MAX_AGE = 72 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;

let express = require('express'),
    app = express(),
    _ = require('lodash'),
    mysql = require('mysql');
    moment = require('moment'),
    router = express.Router(),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    events = require('events'),
    eventEmitter = new events.EventEmitter(),
    bcrypt = require('bcrypt'),
    uuidv4 = require('uuid/v4');

function stringifyOrEmpty(i){
    if(i == "") return "";
    var newStr = JSON.stringify(i);
    newStr = newStr.replace(/'/g, "\'\'");
    return newStr;
}

//TODO
function sendEmail(email, cb){
    console.log( getTime() + " - TODO: Implement sendEmail()");
    cb();
}

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
    console.log( getTime() + '---DB connected as id ' + connection.threadId) ;

    //continue to start the server
    eventEmitter.emit('mysqlReady');

});

///THIS IS REFERENCED IN THE DBAL FILES BUT WE NEED TO EXTEND THE DBAL FUNCTIONS WITH THIS FUNCTION
let execSQL = function(sqlStr, cb){
    console.log("SQL STRING: ", sqlStr);
    connection.query(sqlStr, function (error, result, fields) {
        if (error) {
            cb(error);
        } else {
            cb(null,result);
        }
    });
}

//include the DBAL
let Users = require('./models/PoppitUsers'),
    Companies = require('./models/PoppitCompanies'),
    Campaigns = require('./models/PoppitCampaigns');

//////////////////////////////////////////////////////////////////
// EXPRESS SETUP
//////////////////////////////////////////////////////////////////
//Setup router configuration
const allowedMethods = ['GET', 'POST', 'HEAD', 'OPTIONS'];

app.use(function(error, req, res, next) {
    if (error) {
        return res.status(error.status).send(error.constructor.name);
    }
    return next();
});

//check https methods and whatnot
function policyFilter(req, res, next) {
    if (!allowedMethods.includes(req.method)) {
        return res.sendStatus(404);
    }

    //check session... show login or show dashboard
    if( req.url == '/' && !req.session.isLoggedIn ) {
        console.log( getTime() + ' - : User NOT logged in..routing to login page' );
        return res.redirect('/user/login');
    }
    if( req.url == '/user/login' && req.session.isLoggedIn ) {
        console.log( getTime() + ' - : User logged in..routing to dashboard' );
        return res.redirect('/');
    }
    return next();
}

function getTime(){
    var now = new Date();
    return '[' + (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear() + ':' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ']';
}

// //disable powered by header
app.set('x-powered-by', false);

//Hackers, nothing here to see, move along
router.post('/', function(req, res, next) {
    //just disable this..
    return res.sendStatus(404);
});

//This is the actual request we look for
router.get('/', function(req, res) {
    return res.render('pages/dashboard',{
        data: {
            pageTitle: process.env.APP_NAME + ' | Dashboard'
        }
    });
});

/// add routes here
let user = require('./routes/user.js');

app.use('/user', user);


////////////////////////////////////////////
////    EXPRESS MIDDLEWARE & OPTIONS    ////
////////////////////////////////////////////

// set the view engine to ejs
app.set('view engine', 'ejs');

//where are the static assets?
app.use(express.static('public'))

//Don't need to do parsing just yet..
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//setup session
//app.set('trust proxy', 1) // trust first proxy
app.use(session({
    genid: function(req) { return uuidv4(); },
    secret: 'fdsklgf890-gdf890-fsdf9f-fd888vcx89fsdgjaskjksdjksdkfjdsf',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

//apply our router function to ALL methods defined in router
app.use(policyFilter, router);

//////////////////////////////////////////////////////////////////
// START EXPRESS SERVER
//////////////////////////////////////////////////////////////////

//First wait for mysql connection
eventEmitter.on('mysqlReady', function(){
    // Now start Waterline passing adapters in

    // Start Server
    var port = process.argv[2] || 7777;

    app.listen(port);

    console.log(getTime() + '- Poppit Server is LIVE on port '+port);
});
