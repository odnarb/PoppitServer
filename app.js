/*
* Log mover service for Engage
* Takes log items from a redis db and moves to the SQL DB
* Created: 5/22/2018 by Brandon Chambers
*/

const dotenv = require('dotenv');

//load env vars from .env file
dotenv.config();

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
    uuidv4 = require('uuid/v4');

function stringifyOrEmpty(i){
    if(i == "") return "";
    var newStr = JSON.stringify(i);
    newStr = newStr.replace(/'/g, "\'\'");
    return newStr;
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

let execSQL = function(sqlStr, cb){
    connection.query(sqlStr, function (error, result, fields) {
        if (error) {
            cb(null,error);
        } else {
            cb(result);
        }
    });
}

let Users = {
    find: function(opts,cb){
        let sqlStr = 'select * from poppit_users where id=' + opts.where;
        connection.query(sqlStr, function (error, result, fields) {
            if (error) {
                cb(null,error);
            } else {
                cb(result);
            }
        })
    },
    create: function(obj, cb){
        let cols = "first_name,last_name,email_address,password_hash,address,city,state,zip,updated_at,created_at";
        let rowdata = "";
        let sqlStr = "insert into poppit_users (" + cols + ") VALUES (" +rowdata+ ")" + obj;

        execSQL(sqlStr, function(){
            if (error) {
                cb(null,error);
            } else {
                cb(result);
            }
        });
    },
    delete:  function(id, cb){
        let sqlStr = 'delete from poppit_users where id=' + id;
        execSQL(sqlStr, function(){
            if (error) {
                cb(null,error);
            } else {
                cb(result);
            }
        });
    }
};

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
            pageTitle: 'Poppit | Dashboard'
        }
    });
});

router.get('/user/login', function(req, res) {
    console.log( getTime() + '---GET /user/login');

    return res.render('pages/login',{
        data: {
            pageTitle: 'Poppit | Login'
        }
    });
});

router.post('/user/login', function(req, res) {
    console.log( getTime() + '---POST /user/login: ', req.body);

    if( !req.body ){
        return res.send(400);
    }

    if( req.body.email && req.body.email == "bran.cham@gmail.com" ){
        if( req.body.password && req.body.password == "321321321" ){
            req.session.regenerate(function(err) {
                console.log( getTime() + ' - : User logged IN' );
                req.session.isLoggedIn = true;
                if( req.body.remember && req.body.remember == "on" ){
                    req.session.cookie.maxAge = COOKIE_MAX_AGE;
                }
                return res.send({ result: 'user logged IN'});
            });
        } else {
            return res.send(400);
        }
    } else {
        return res.send(400);
    }
});

router.get('/user/logout', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/user/login');
    });
});

router.post('/user/signup', function(req, res) {
    console.log( getTime() + ' - : User signed up', req.body );
    return res.send({ result: 'user signed up', user_info: req.body });
});

router.get('/user/forgotpassword', function(req, res) {
    console.log( getTime() + ' - : User forgotpassword: ', req.body );
    return res.send({ result: 'user forgotpassword'});
});

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