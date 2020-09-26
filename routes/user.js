//user routes

let express = require('express');
let router = express.Router();

// // user/login
// router.get('/login', (req, res) => {

//     console.log( "user :: globals? ", globals );

//     return res.render('pages/login',{
//         data: {
//             pageTitle: process.env.APP_NAME + ' | Login'
//         }
//     });
// });

// // user/login
// router.post('/login', (req, res) =>{
//     if( !req.body ){
//         return res.status(400).json({reason: "no_params_sent"});
//     } else if (!req.body.email){
//         return res.status(400).json({ reason: "no_email" });
//     } else if (!req.body.password){
//         return res.status(400).json({ reason: "no_password" });
//     }

//     let userEmail = { email: req.body.email };
//     Users.find(userEmail, (err,user) => {
//         if(err){
//             console.log( "DB User.find() error: ", err);
//             return res.status(500).json({reason: "server_error"});
//         }

//         //user not found at all
//         if ( user == undefined ){
//             return res.status(400).json({reason: "no_user"});
//         }

//         if( bcrypt.compareSync(req.body.password, user.password_hash) ){

//             //only check if the passwords match
//             //user has not been activated
//             if( user.active == 0 ){
//                 return res.status(400).json({reason: "not_active"});
//             }

//             req.session.regenerate( (err) => {
//                 console.log( "User logged IN" );
//                 req.session.isLoggedIn = true;
//                 req.session.user = user;
//                 if( req.body.remember && req.body.remember == "on" ){
//                     req.session.cookie.maxAge = COOKIE_MAX_AGE;
//                 }
//                 return res.send({ result: user });
//             });
//         } else {
//             return res.status(400).json({reason: "no_user"});
//         }
//     })
// });

// router.post('/signup', (req, res) => {
//     console.log("signup query: ", req.query);
//     console.log("signup params: ", req.params);
//     console.log("signup body: ", req.body);

//     return res.json({ register_params: true });
// });

let UserModel = require('../models/PoppitUsers');

module.exports = (globals) => {
    user: return router
    // user/ (get all users)
    .get('/', (req, res) => {

        let User = new UserModel( globals );

        //get users
        User.find({ id: req.params.id }, (err, users) => {
            if(err){
                globals.logger.error("fetch error: ", err);
                return res.sendError();
            }

            globals.logger.info(`GET /user :: `, users);

            return res.json({ page: 'GET /user'});
        });
    })
    // user/login
    .get('/login', (req, res) => {
        let gres = (globals.logger == undefined )? true : false;
        console.log( "GET /user/login :: globals? ", gres );
        return res.json({ page: 'GET /user/login'});
    })
    // user/login
    .post('/login', (req, res) => {
        let gres = (globals.logger == undefined )? true : false;
        console.log( "POST /user/login :: globals? ", gres );
        return res.json({ page: 'POST /user/login'});
    })
    .post('/signup', (req, res) => {
        let gres = (globals.logger == undefined )? true : false;
        console.log( "POST /user/signup :: globals? ", gres );
        return res.json({ page: 'POST /user/signup'});
    })
    .get('/something', (req, res) => {
        let gres = (globals.logger == undefined )? true : false;
        console.log( "GET /user/something :: globals? ", gres );
        return res.json({ page: 'GET /user/something'});
    })
    // user/:id
    .get('/:id', (req, res) => {
        let User = new UserModel( globals );

        //get user
        User.findOne({ id: parseInt(req.params.id) }, (err, user) => {
            if(err){
                globals.logger.error("fetch error: ", err);
                return res.sendError();
            }

            globals.logger.info( "GET /user/:id :: user? ", user );
            return res.json({ page: 'GET /user/:id'});
        });
    })
};