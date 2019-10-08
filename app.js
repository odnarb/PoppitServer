/*
* Log mover service for Engage
* Takes log items from a redis db and moves to the SQL DB
* Created: 5/22/2018 by Brandon Chambers
*/

const COOKIE_MAX_AGE = 72 * 60 * 60 * 1000;

let express = require('express'),
    _ = require('lodash'),
    // Waterline = require('waterline'),
    // mySqlAdapter = require('sails-mysql'),
    app = express(),
    moment = require('moment'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    // events = require('events'),
    // eventEmitter = new events.EventEmitter(),
    session = require('express-session'),
    uuidv4 = require('uuid/v4');

function stringifyOrEmpty(i){
    if(i == "") return "";
    var newStr = JSON.stringify(i);
    newStr = newStr.replace(/'/g, "\'\'");
    return newStr;
}

// sqlConnection.on('connect', function(err) {
//     if (err) {
//         console.log("---SQL Connection error: ", err);
//         process.exit(1);
//     }
//     eventEmitter.emit('tdsReady');
// });

//////////////////////////////////////////////////////////////////
// WATERLINE CONFIG
//////////////////////////////////////////////////////////////////
// Instantiate a new instance of the ORM
// var orm = new Waterline();

// var waterlineConfig = {
//     adapters: {
//         'sails-mysql': mySqlAdapter
//     },

//     // Build Connections Config
//     // Setup connections using the named adapter configs
//     connections: {
//         mysql: {
//             adapter: 'sails-mysql',
//             db: 'sails'
//         }
//     },

//     defaults: {
//         migrate: 'safe',
//         schema: true
//     }
// };

//////////////////////////////////////////////////////////////////
// WATERLINE MODELS
//////////////////////////////////////////////////////////////////

// var UserModel = require('./api/models/User');
// var AccountModel = require('./api/models/Account');

// var User = Waterline.Collection.extend(UserModel);
// var Account = Waterline.Collection.extend(AccountModel);

// // Load the Models into the ORM
// orm.loadCollection(User);
// orm.loadCollection(Account);

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
// START WATERLINE & EXPRESS
//////////////////////////////////////////////////////////////////

// //First wait for tds/sql connection
// eventEmitter.on('tdsReady', function(){
//     // Now start Waterline passing adapters in
//     orm.initialize(waterlineConfig, function(err, models) {
//         if (err) throw err;

//         app.models = models.collections;
//         app.connections = models.connections;

//         // Start Server
//         process_num = process.argv[2] || 1;
//         var port = process.argv[3] || 7777;

//         app.listen(port);

//         console.log(getTime() + '- Jib Logger Mover is LIVE on port '+port);
//     });
// });


// Start Server
var port = process.argv[2] || 7777;

app.listen(port);
console.log(getTime() + '- Poppit Server is LIVE on port '+port);