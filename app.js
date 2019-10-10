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

let Users = {
    find: function(opts,cb){
        let sqlStr = "select `first_name`,`last_name`,`email_address`,`password_hash`,`active`,`created_at`,`updated_at` from poppit_users where email_address=" + mysql.escape(opts.email) + " limit 1;";

        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                console.log(getTime() + " - Users.find() result?: ", result[0]);
                cb(null,result[0]);
            }
        });
    },
    create: function(vals, cb){

        let cols = ["first_name","last_name","email_address","password_hash"];
        let sqlStr = "insert into poppit_users SET " +mysql.escape(vals)+ ";";

        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                console.log(getTime() + " - Users.create() result?: ", result);
                cb(null,result);
            }
        });
    },
    delete:  function(id, cb){
        let sqlStr = 'delete from poppit_users where id=' + id;
        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                cb(null, result);
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
            pageTitle: process.env.APP_NAME + ' | Dashboard'
        }
    });
});

router.get('/user/login', function(req, res) {
    console.log( getTime() + '---GET /user/login');

    return res.render('pages/login',{
        data: {
            pageTitle: process.env.APP_NAME + ' | Login'
        }
    });
});

router.post('/user/login', function(req, res) {
    console.log( getTime() + '---POST /user/login: ', req.body);

    if( !req.body ){
        return res.status(400).json({reason: "no_params_sent"});
    } else if (!req.body.email){
        return res.status(400).json({ reason: "no_email" });
    } else if (!req.body.password){
        return res.status(400).json({ reason: "no_password" });
    }

    Users.find({ email: req.body.email }, function(err,user) {
        if(err){
            console.log( getTime() + " - DB User.find() error: ", err);
            return res.status(500).json({reason: "server_error"});
        }

        //user not found at all
        if( user == undefined ){
            return res.status(400).json({reason: "no_user"});
        }

        if( bcrypt.compareSync(req.body.password, user.password_hash) ){

            //only check if the passwords match
            //user has not been activated
            if( user.active == 0 ){
                return res.status(400).json({reason: "not_active"});
            }

            req.session.regenerate(function(err) {
                console.log( getTime() + ' - : User logged IN' );
                req.session.isLoggedIn = true;
                req.session.user = user;
                if( req.body.remember && req.body.remember == "on" ){
                    req.session.cookie.maxAge = COOKIE_MAX_AGE;
                }
                return res.send({ result: user });
            });
        } else {
            return res.status(400).json({reason: "no_user"});
        }
    })
});

router.get('/user/logout', function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/user/login');
    });
});

router.post('/user/signup', function(req, res) {
    console.log( getTime() + '---POST /user/signup: ', req.body);

    if( !req.body ){
        return res.status(400).json({ reason: "no_params_sent" });
    } else if ( !req.body.first_name ){
        return res.status(400).json({ reason: "no_first_name" });
    } else if ( !req.body.last_name ){
        return res.status(400).json({ reason: "no_last_name" });
    } else if ( !req.body.email ){
        return res.status(400).json({ reason: "no_email" });
    } else if ( !req.body.password ){
        return res.status(400).json({ reason: "no_password" });
    } else if ( !req.body.rpassword ){
        return res.status(400).json({ reason: "no_rpassword" });
    } else if ( req.body.password !== req.body.rpassword  ){
        return res.status(400).json({ reason: "password_mismatch" });
    }

    let user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email_address: req.body.email,
        password_hash: bcrypt.hashSync(req.body.password, SALT_ROUNDS)
    };

    Users.find({ email: req.body.email }, function(err,found_user) {
        if(err){
            console.log( getTime() + " - DB User.find() error: ", err);
            return res.status(500).json({reason: "server_error"});
        }

        //user not found at all
        if( found_user != undefined ){
            return res.status(400).json({ reason: "email_already_taken" });
        }

        Users.create(user, function(err,result){
            if(err){
                console.log( getTime() + " - DB User.create() error: ", err);
                return res.status(500).json({reason: "server_error"});
            }
            if( result.affectedRows == 0 ){
                return res.status(400).json({reason: "no_user"});
            } else {
                sendEmail( found_user.email_address, function(){
                    return res.send({ result: 'success' });
                });
            }
        }); //Users.create()
    }); //Users.find()
});

router.post('/user/forgotpassword', function(req, res) {
    console.log( getTime() + '---POST /user/signup: ', req.body);

    if( !req.body ){
        return res.status(400).json({ reason: "no_params_sent" });
    } else if ( !req.body.email ){
        return res.status(400).json({ reason: "no_email" });
    }

    Users.find({ email: req.body.email }, function(err,found_user) {
        if(err){
            console.log( getTime() + " - DB User.find() error: ", err);
            return res.status(500).json({reason: "server_error"});
        }

        if( found_user ){
            //send email
            if( found_user.active == 1) {
                sendEmail( found_user.email_address, function(){
                    return res.send({ result: 'success' });
                });
            } else {
                return res.status(400).json({ reason: 'not_active' });
            }
        } else {
            return res.status(400).json({ reason: 'no_email' });
        }
    }); //Users.find()
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