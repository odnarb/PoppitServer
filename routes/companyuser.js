//companyuser routes

let express = require('express');
let router = express.Router();

const uuid = require('uuid');
const bcrypt = require('bcrypt');

let CompanyUserModel = require('../models/PoppitCompanyUsers');

//14 days
const COOKIE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

//1 hr
const COOKIE_MIN_AGE =  60 * 60 * 1000;

module.exports = (globals) => {
    return router
    // /setcontext/:id
    .get('/setcontext/:id', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "GET /companyuser/setcontext/:id";

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: company id: ${req.params.id}` );

            globals.logger.debug( `${routeHeader} :: user: `, req.session.user );

            if(req.session.user.admin === 1){
                globals.logger.debug( `${routeHeader} :: BEFORE CompanyUser.findOne() :: company id: ${req.params.id}` );

                CompanyUser.findOne({ email_address: req.params.id }, (err, dbRes) => {
                    if(err){
                        res.status(500);
                        return next(err);
                    }

                    globals.logger.debug( `${routeHeader} :: AFTER CompanyUser.findOne() :: dbRes:`, dbRes);

                    globals.logger.debug( `${routeHeader} :: AFTER CompanyUser.findOne() :: req.session:`, req.session);

                    let context_res = { success: false }
                    if( dbRes !== undefined ){
                        req.session.companyuser_context = dbRes;

                        globals.logger.debug( `${routeHeader} :: NEW req.session.companyuser_context:`, req.session.companyuser_context);

                        context_res.company = dbRes;
                        context_res.success = true;
                    }
                    globals.logger.debug( `${routeHeader} :: END` );

                    return res.json(context_res);
                });
            } else {
                globals.logger.debug( `${routeHeader} :: user :: ${req.session.user.id} ${req.session.user.email_address} :: NOT admin for company context :: company id: ${req.params.id}` );

                return res.redirect('/');
            }
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
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
                CompanyUser.find(req.query, (err, dbresult) => {

                    let users = dbresult[0];
                    for(let i=0; i < users.length;i++) {
                        let user = users[i];
                        let res = "none";
                        if (user.company_role === 1) {
                            res = "admin"
                        } else if (user.company_role === 2) {
                            res = "technical";
                        } else if (user.company_role === 3) {
                            res = "marketing";
                        }
                        user.company_role = res;
                        users[i] = user;
                    }

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
                        aaData: users,
                        iTotalRecords: dbresult[1].totalCount,
                        iTotalDisplayRecords: dbresult[2].totalCountWithFilter
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
                    pageTitle: "Search Company Users"
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
                pageTitle: "Login",
                showForm: "login",
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
        let routeHeader = "POST /companyuser/login";

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

                globals.logger.debug( `${routeHeader} :: after get user: `, user);

                //user not found at all
                if ( user == undefined ){
                    globals.logger.debug( `${routeHeader} :: after get user, incorrect_username: `, user);

                    return res.status(403).json({reason: "no_user"});
                }

                globals.logger.debug( `${routeHeader} :: bcrypt: `, req.body.password, user.password_hash);

                if( bcrypt.compareSync(req.body.password, user.password_hash) ){

                    globals.logger.debug( `${routeHeader} :: bcrypt match!`);

                    //only check if the passwords match
                    //user has not been activated
                    if( user.active == 0 ){
                        return res.status(403).json({reason: "no_user"});
                    }

                    globals.logger.info( `CompanyUser.id=${user.id} logged IN` );

                    //remove the password_hash field before being saved to the session
                    delete user.password_hash;
                    delete user.forgot_password_token;

                    //save the session to redis store
                    req.session.regenerate( (err) => {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        if( req.body.remember && req.body.remember == "on" ){
                            req.session.cookie.maxAge = COOKIE_MAX_AGE;
                        } else {
                            req.session.cookie.maxAge = COOKIE_MIN_AGE;
                        }
                        return res.json({ success: true });
                    });
                } else {
                    globals.logger.debug( `${routeHeader} :: bad pw: `, user);

                    return res.status(403).json({reason: "no_user"});
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
    // create user
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

            //save the password hash
            createParams.password_hash = hash;

            //create a token for first login
            createParams.invite_token = uuid.v4()

            delete createParams._csrf;

            CompanyUser.create(createParams, (err, new_user_id) => {
                if(err && err.error_type == "user") {
                    res.status(400);
                    return next(err);
                } else if(err) {
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: CompanyUser created: ${new_user_id}` );

                /*
                //now send some emails
                globals.logger.info( `${routeHeader} :: Send registration email...` );

                let regEmail = globals.admin_registration_email({ user: createParams })

                //send regristration email
                let email = {
                    to: createParams.email_address,
                    from: `${process.env.ADMIN_EMAIL}`,
                    subject: `[${process.env.APP_NAME}] New User Registered`,
                    html: regEmail.html,
                    text: regEmail.text
                }

                globals.sendEmail(email, (err,emailRes) => {
                    if(err){
                        next(err);
                    } else {
                        globals.logger.info( `${routeHeader} :: Email sent to new user: ${createParams.email_address}` );
                    }
                });

                let regUserEmail = globals.user_registration_email({ user: createParams });

                email = {
                    to: createParams.email_address,
                    from: `${process.env.ADMIN_EMAIL}`,
                    subject: `[${process.env.APP_NAME}] Registration Confirm`,
                    html: regUserEmail.html,
                    text: regUserEmail.text
                }

                globals.sendEmail(email, (err,emailRes) => {
                    if(err){
                        next(err);
                    } else {
                        globals.logger.info( `${routeHeader} :: Admin email sent for new registration:` );
                    }
                });
                */

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, user_id: new_user_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
     // companyuser/newpassword
    .get('/newpassword', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "GET /companyuser/newpassword";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {
            globals.logger.debug( `${routeHeader} :: id:: ${req.session.user.id} :: needsNewpassword :: ${req.session.needsNewpassword}`);

            if(!req.session.needsNewpassword){

                globals.logger.debug( `${routeHeader} :: Does not need new password :: END`);

                return res.redirect('/companyuser/login');
            } else {
                globals.logger.debug( `${routeHeader} :: Show change password form :: END`);

                return res.render('pages/login', {
                    pageTitle: "New Password",
                    showForm: "newpassword",
                    layout: 'login_layout'
                });
            }
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
     // companyuser/newpassword
    .post('/newpassword', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "POST /companyuser/newpassword";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {
            let validNewpassword = (req.session.user && req.session.user.id && req.session.needsNewpassword);

            //check password1 and password2
            let pw1 = req.body.password1;
            let pw2 = req.body.password2;

            globals.logger.debug( `${routeHeader} :: validNewpassword :: ${validNewpassword}`);

            globals.logger.debug( `${routeHeader} :: pw1 :: ${pw1} :: pw2 :: ${pw2}`);

            let invalidPws = (pw1 !== pw2 && pw1 !== '' && pw2 !== '');

            if(!validNewpassword) {
                res.status(400);
                next();
                // return next();
            } else if (invalidPws) {
                return res.json({ success: false })
            } else {
                 globals.logger.debug( `${routeHeader} :: generating pw hash...`);

                //auto-generate a password for the user when created via the panel
                const salt = bcrypt.genSaltSync(globals.salt_rounds);
                const hash = bcrypt.hashSync(pw1, salt);

                //save the password hash
                let updateParams = {
                    id: req.session.user.id,
                    user: {
                        password_hash: hash
                    }
                };

                delete req.session.needsNewpassword;

                 globals.logger.debug( `${routeHeader} :: before user update`, updateParams);

                CompanyUser.update(updateParams, (err, dbres) => {
                    if(err){
                        res.status(500);
                        return next(err);
                    }

                    if( dbres[0].changedRows > 0 ){
                        let user = dbres[1];

                        globals.logger.debug( `${routeHeader} :: user ::`, user);

                        //save the session to redis store
                        req.session.regenerate( (err) => {
                            req.session.isLoggedIn = true;
                            req.session.user = user;

                            return res.json({ success: true });
                            // return res.redirect('/');
                        });
                    } else {
                        globals.logger.debug( `${routeHeader} :: ERROR :: id:: ${req.params.id} :: token :: ${req.params.token}`);

                        //invalid request
                        res.status(400);
                        return res.json({ success: false })
                    }
                });
            } //endif validNewpassword
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
     // companyuser/confirm/:id/:token
    .get('/confirm/:id/:token', (req, res, next) => {
        let CompanyUser = new CompanyUserModel( globals );
        let routeHeader = "GET /companyuser/confirm/:id/:token";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {

            globals.logger.debug( `${routeHeader} :: id:: ${req.params.id} :: token :: ${req.params.token}`);

            let tokenParams = {
                id: parseInt(req.params.id),
                token: req.params.token
            };

            CompanyUser.confirmRegistration(tokenParams, (err, dbres) => {
                globals.logger.debug( `${routeHeader} :: Back from db`);

                if(err){
                    res.status(500);
                    return next(err);
                }

                if(dbres[0].changedRows > 0){
                    globals.logger.debug( `${routeHeader} :: SUCCESS :: id:: ${req.params.id} :: token :: ${req.params.token}`);

                    let user = dbres[1];

                    globals.logger.debug( `${routeHeader} :: user :: ${user}`);

                    delete user.password_hash;
                    delete user.forgot_password_token;
                    delete user.invite_token;

                    req.session.user = user;
                    req.session.needsNewpassword = true;
                    req.session.isLoggedIn = false;

                    globals.logger.debug( `${routeHeader} :: SESSION SET :: ${req.session}`);

                    //success
                    return res.redirect('/companyuser/newpassword');
                } else {
                    globals.logger.debug( `${routeHeader} :: ERROR :: id:: ${req.params.id} :: token :: ${req.params.token}`);

                    //invalid request
                    res.status(400);
                    return next(err);
                }
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
            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get user
            CompanyUser.findOne({ id: parseInt(req.params.id) }, (err, user) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.debug(`GET /companyuser/:id :: user.id: ${req.params.id}`, user);

                globals.logger.debug( `${routeHeader} :: END` );

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

            let user = req.body;
            delete user._csrf;
            let updateParams = { id: parseInt(req.params.id), user: req.body };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            CompanyUser.update(updateParams, (err, dbres) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                let user = dbres[2][0];
                globals.logger.debug( `${routeHeader} :: user ::`, user);

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