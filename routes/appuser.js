//appuser routes

let express = require('express');
let router = express.Router();

const uuid = require('uuid');
const bcrypt = require('bcrypt');

let UserModel = require('../models/PoppitUsers');

module.exports = (globals) => {
    return router
    // appuser/ (get all users)
    .get('/', (req, res, next) => {
        let User = new UserModel( globals );
        let routeHeader = "GET /appuser (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /appuser (XHR)";

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
                    return res.json({
                        aaData: users[0],
                        iTotalRecords: users[1].totalCount,
                        iTotalDisplayRecords: users[2].totalCountWithFilter
                    });
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        } else {
            try {
                globals.logger.debug( `${routeHeader} :: BEGIN`);

                globals.logger.debug( `${routeHeader} :: DONE`);
                return res.render('pages/appuser',{
                    pageTitle: "Search App Users"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    // appuser/login
    .post('/login', (req, res, next) => {
        let User = new UserModel( globals );
        let routeHeader = "POST /appuser/login";

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN`);

            if( !req.body ){
                return res.status(400).json({reason: "no_params_sent"});
            } else if (!req.body.email){
                return res.status(400).json({ reason: "no_email" });
            } else if (!req.body.password){
                return res.status(400).json({ reason: "no_password" });
            }

            let userEmail = { email_address: req.body.email };
            User.findOne(userEmail, (err,user) => {
                if(err){
                    globals.logger.debug( `${routeHeader} :: DB User.find() error: `, err);
                    return res.status(500).json({reason: "server_error"});
                }

                //user not found at all
                if ( user == undefined ){
                    globals.logger.debug( `${routeHeader} :: user not found, login denied: `, req.body.email);
                    return res.status(403).json({reason: "no_user"});
                }

                if( bcrypt.compareSync(req.body.password, user.password_hash) ){
                    //only check if the passwords match
                    //user has not been activated
                    if( user.active == 0 ){
                        globals.logger.debug( `${routeHeader} :: user inactive, login denied: `, req.body.email);
                        return res.status(403).json({reason: "no_user"});
                    }

                    globals.logger.info( `User.id=${user.id} logged IN` );

                    //remove the password_hash field before being saved to the session
                    delete user.password_hash;
                    delete user.forgot_password_token;

                    //save the session to redis store
                    req.session.regenerate( (err) => {
                        req.session.isLoggedIn = true;
                        req.session.appuser = true;
                        req.session.user = user;
                        if( req.body.remember && req.body.remember == "on" ){
                            req.session.cookie.maxAge = globals.COOKIE_MAX_AGE;
                        } else {
                            req.session.cookie.maxAge = globals.COOKIE_MIN_AGE;
                        }
                        globals.logger.info( `${routeHeader} :: User.id=${user.id} logged IN` );

                        return res.json({ success: true });
                    });
                } else {
                    globals.logger.debug( `${routeHeader} :: bad pw, login denied: `, req.body.email);
                    return res.status(403).json({reason: "no_user"});
                }
            });

        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // appuser/logout
    .get('/logout', (req, res, next) => {
        let routeHeader = "GET /appuser/logout";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        let logoutRes = { success: true }

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN`);

            if( req.session && req.session.isLoggedIn ){
                //delete the session
                req.session.destroy()
            } else {
                logoutRes.success = false;
            }

            return res.json(logoutRes);
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // appuser/signup
    .post('/signup', (req, res, next) => {
        let gres = (globals.logger == undefined )? true : false;
        globals.logger.info( "POST /appuser/signup :: globals? ", gres );
        return res.json({ page: 'POST /appuser/signup'});
    })
    // appuser/checkcookie
    .post('/checkcookie', (req, res, next) => {
        // let User = new UserModel( globals );
        let routeHeader = "POST /checkcookie";

        try {
            globals.logger.info( `${routeHeader} :: START` );

            if( req.session.user && req.session.user.id ) {
                globals.logger.info( `${routeHeader} :: DONE :: logged in` );
                return res.json({ success: true, loggedin: true, user_id: req.session.user.id });
            } else {
                globals.logger.info( `${routeHeader} :: DONE :: NOT logged in` );
                return res.json({ success: false, loggedin: false });
            }
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // appuser/:id operations
    .get('/:id', (req, res, next) => {
        let User = new UserModel( globals );
        let routeHeader = "GET /appuser/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get user
            User.findOne({ id: parseInt(req.params.id) }, (err, user) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /appuser/:id :: user.id: ${req.params.id}`, user);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(user);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/:id', (req, res, next) => {
        let User = new UserModel( globals );
        let routeHeader = "PUT /appuser/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let user = req.body 
            delete user._csrf;
            let updateParams = { id: parseInt(req.params.id), user: user };

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
        let User = new UserModel( globals );
        let routeHeader = "DELETE /appuser/:id ";

        try {
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