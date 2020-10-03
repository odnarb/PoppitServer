//user routes

let express = require('express');
let router = express.Router();

// user/login


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
//             globals.logger.info( "DB User.find() error: ", err);
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
//                 globals.logger.info( "User logged IN" );
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
//     globals.logger.info("signup query: ", req.query);
//     globals.logger.info("signup params: ", req.params);
//     globals.logger.info("signup body: ", req.body);

//     return res.json({ register_params: true });
// });

let UserModel = require('../models/PoppitUsers');

module.exports = (globals) => {
    return router
    // user/ (get all users)
    .get('/', (req, res, next) => {
        let User = new UserModel( globals );
        let routeHeader = "GET /user (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /user (XHR)";

            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered user list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get users
                User.find(req.query, (err, users) => {
                    globals.logger.debug( `${routeHeader} :: DB CB: `, err);

                    if(err && err.error_type === "system"){
                        globals.logger.debug( `${routeHeader} :: DB ERROR: `, err);
                        res.status(500);
                        return next(err);
                    } else if( err && err.error_type === "user"){
                        globals.logger.debug( `${routeHeader} :: User DB ERROR: `, err);
                        res.status(400);
                        return next(err);
                    }
                    globals.logger.debug( `${routeHeader} :: DONE`);
                    return res.json({ aaData: users });
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        } else {
            try {
                globals.logger.debug( `${routeHeader} :: BEGIN`);

                globals.logger.debug( `${routeHeader} :: DONE`);
                return res.render('pages/user',{
                    pageTitle: `${process.env.APP_NAME} | Search Users`
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    // user/login
    .get('/login', (req, res, next) => {

        globals.logger.info( "GET /user/login" );

        return res.render('pages/login', {
            data: {
                pageTitle: process.env.APP_NAME + ' | Login'
            },
            layout: 'login_layout'
        });
    })
    // user/login
    .post('/login', (req, res, next) => {
        let gres = (globals.logger == undefined )? true : false;
        globals.logger.info( "POST /user/login :: globals? ", gres );
        return res.json({ page: 'POST /user/login'});
    })
    .post('/signup', (req, res, next) => {
        let gres = (globals.logger == undefined )? true : false;
        globals.logger.info( "POST /user/signup :: globals? ", gres );
        return res.json({ page: 'POST /user/signup'});
    })
    //create user
    .post('/', (req, res, next) => {
        try {
            let User = new UserModel( globals );

            let routeHeader = "POST /user";
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            User.create(createParams, (err, new_user_id) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: User created: ${new_user_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, user_id: new_user_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // user/:id operations
    .get('/:id', (req, res, next) => {
        try {
            let User = new UserModel( globals );

            let routeHeader = "GET /user/:id";
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get user
            User.findOne({ id: parseInt(req.params.id) }, (err, user) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /user/:id :: user.id: ${req.params.id}`, user);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(user);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/:id', (req, res, next) => {
        try {
            let User = new UserModel( globals );
            let routeHeader = "PUT /user/:id ";

            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let updateParams = { id: parseInt(req.params.id), user: req.body };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            User.update(updateParams, (err, user) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true, user: user });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .delete('/:id', (req, res, next) => {
        try {
            let User = new UserModel( globals );

            let routeHeader = "DELETE /user/:id ";
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            User.delete( parseInt(req.params.id), (err, deleteRes) => {
                if(err){
                    res.status(500);
                    return next(err);
                }
                globals.logger.info( routeHeader  + " :: res", deleteRes );

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    });
};