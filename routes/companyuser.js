//companyuser routes

let express = require('express');
let router = express.Router();

const uuid = require('uuid');
const bcrypt = require('bcrypt');

let CompanyUserModel = require('../models/PoppitCompanyUsers');

const COOKIE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

module.exports = (globals) => {
    return router
    // companyuser/ (get all users)
    .get('/', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "GET /companyuser (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /companyuser (XHR)";

            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered user list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get users
                CompanyUser.find(req.query, (err, users) => {
                    globals.logger.debug( `${routeHeader} :: DB CB: `, err);

                    if(err && err.error_type === "system"){
                        globals.logger.debug( `${routeHeader} :: DB ERROR: `, err);
                        res.status(500);
                        return next(err);
                    } else if( err && err.error_type === "user"){
                        globals.logger.debug( `${routeHeader} :: CompanyUser DB ERROR: `, err);
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
                return res.render('pages/companyuser',{
                    pageTitle: `${process.env.APP_NAME} | Search Company Users`
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    // companyuser/login
    .get('/login', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "GET /companyuser/login";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {

            globals.logger.debug( `${routeHeader} :: DONE`);

            return res.render('pages/login', {
                data: {
                    pageTitle: process.env.APP_NAME + ' | Login'
                },
                layout: 'login_layout'
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // companyuser/login
    .post('/login', (req, res, next) => {

        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "POST /companyuser";

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
            CompanyUser.findOne(userEmail, (err,user) => {
                if(err){
                    globals.logger.info( "DB CompanyUser.find() error: ", err);
                    return res.status(500).json({reason: "server_error"});
                }

                //user not found at all
                if ( user == undefined ){
                    return res.status(400).json({reason: "incorrect_username"});
                }

                if( bcrypt.compareSync(req.body.password, user.password_hash) ){

                    //only check if the passwords match
                    //user has not been activated
                    if( user.active == 0 ){
                        return res.status(400).json({reason: "not_active"});
                    }

                    if( bcrypt.compareSync(req.body.password, user.password_hash) ){

                        globals.logger.info( `CompanyUser.id=${user.id} logged IN` );

                        //remove the password_hash field before being saved to the session
                        delete user.password_hash;
                        delete user.forgot_password_token;

                        //save the session to redis store
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        if( req.body.remember && req.body.remember == "on" ){
                            req.session.cookie.maxAge = COOKIE_MAX_AGE;
                        }

                        return res.json({ success: true });
                    } else {
                        return res.status(400).json({reason: "no_user"});
                    }
                }
            });

        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // companyuser/logout
    .get('/logout', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "GET /companyuser/logout";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN`);

            if( req.session && req.session.isLoggedIn ){
                //delete the session
                req.session.destroy()

                return res.redirect('/companyuser/login');
            } else {
                return res.redirect('/');
            }
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .post('/signup', (req, res, next) => {
        let gres = (globals.logger == undefined )? true : false;
        globals.logger.info( "POST /companyuser/signup :: globals? ", gres );
        return res.json({ page: 'POST /companyuser/signup'});
    })
    //create user
    .post('/', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "POST /companyuser";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            //auto-generate a password for the user when created via the panel
            const salt = bcrypt.genSaltSync(globals.salt_rounds);
            const hash = bcrypt.hashSync(uuid.v4(), salt);

            createParams.password_hash = hash;

            CompanyUser.create(createParams, (err, new_user_id) => {
                if(err && err.error_type == "user") {
                    res.status(400);
                    return next(err);
                } else if(err) {
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: CompanyUser created: ${new_user_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, user_id: new_user_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // companyuser/:id operations
    .get('/:id', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "GET /companyuser/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get user
            CompanyUser.findOne({ id: parseInt(req.params.id) }, (err, user) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /companyuser/:id :: user.id: ${req.params.id}`, user);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(user);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/:id', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "PUT /companyuser/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let updateParams = { id: parseInt(req.params.id), user: req.body };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            CompanyUser.update(updateParams, (err, user) => {
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
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "DELETE /companyuser/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            CompanyUser.delete( parseInt(req.params.id), (err, deleteRes) => {
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