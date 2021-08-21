//user routes

let express = require('express');
let router = express.Router();

const uuid = require('uuid');
const bcrypt = require('bcrypt');

let UsersModel = require('../models/Users');

module.exports = (globals) => {
    return router
    // /setcontext/:id
    .get('/setcontext/:id', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /user/setcontext/:id";

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: user id: ${req.params.id}` );

            globals.logger.debug( `${routeHeader} :: user: `, req.session.user );

            if(req.session.user.is_admin === 1){
                globals.logger.debug( `${routeHeader} :: BEFORE Users.findOne() :: user id: ${req.params.id}` );

                Users.findOne({ email_address: req.params.id }, (err, dbRes) => {
                    if(err){
                        res.status(500);
                        return next(err);
                    }

                    globals.logger.debug( `${routeHeader} :: AFTER Users.findOne() :: dbRes:`, dbRes);

                    globals.logger.debug( `${routeHeader} :: AFTER Users.findOne() :: req.session:`, req.session);

                    let context_res = { success: false }
                    if( dbRes !== undefined ){
                        req.session.user_context = dbRes;

                        globals.logger.debug( `${routeHeader} :: NEW req.session.user_context:`, req.session.user_context);

                        context_res.user = dbRes;
                        context_res.success = true;
                    }
                    globals.logger.debug( `${routeHeader} :: END` );

                    return res.json(context_res);
                });
            } else {
                globals.logger.debug( `${routeHeader} :: user :: ${req.session.user.id} ${req.session.user.email_address} :: NOT admin for user context :: user id: ${req.params.id}` );

                return res.redirect('/');
            }
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // user/ (get all users)
    .get('/', (req, res, next) => {
        let Users = new UsersModel( globals );
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

                //get user
                Users.find(req.query, (err, dbresult) => {

                    let user = dbresult[0];
                    for(let i=0; i < user.length;i++) {
                        let user = user[i];
                        let res = "none";
                        if (user.company_role === 1) {
                            res = "admin"
                        } else if (user.company_role === 2) {
                            res = "technical";
                        } else if (user.company_role === 3) {
                            res = "marketing";
                        }
                        user.company_role = res;
                        user[i] = user;
                    }

                    globals.logger.debug( `${routeHeader} :: DB CB: `, err);

                    if(err && err.error_type === "system"){
                        globals.logger.debug( `${routeHeader} :: DB ERROR: `, err);
                        res.status(500);
                        return next(err);
                    } else if( err && err.error_type === "user"){
                        globals.logger.debug( `${routeHeader} :: Users DB ERROR: `, err);
                        res.status(400);
                        return next(err);
                    }
                    globals.logger.debug( `${routeHeader} :: DONE`);
                    return res.json({
                        aaData: user,
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
                return res.render('pages/user',{
                    pageTitle: "Search Users"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    // user/login
    .get('/login', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /user/login";

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
    // user/login
    .post('/login', (req, res, next) => {

        let Users = new UsersModel( globals );
        let routeHeader = "POST /user/login";

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN`);

            if( !req.body ){
                globals.logger.debug( `${routeHeader} :: ERR 1 `);
                return res.status(400).json({reason: "no_params_sent"});
            } else if (!req.body.email){
                globals.logger.debug( `${routeHeader} :: ERR 2`);

                return res.status(400).json({ reason: "no_email" });
            } else if (!req.body.password){
                globals.logger.debug( `${routeHeader} :: ERR 3 `);

                return res.status(400).json({ reason: "no_password" });
            }

            let userEmail = { email_address: req.body.email };
            Users.findOne(userEmail, (err,user) => {
                if(err){
                    globals.logger.debug( `${routeHeader} :: DB Users.find() error: `, err);
                    return res.status(500).json({reason: "server_error"});
                }

                //user not found at all
                if ( user === undefined ){
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

                    globals.logger.info( `Users.id=${user.id} logged IN, regen session` );

                    //remove the password_hash field before being saved to the session
                    delete user.password_hash;
                    delete user.forgot_password_token;

                    //save the session to redis store
                    req.session.regenerate( (err) => {
                        req.session.isLoggedIn = true;
                        req.session.user = JSON.parse(JSON.stringify(user));
                        if( req.body.remember && req.body.remember == "on" ){
                            req.session.cookie.maxAge = globals.COOKIE_MAX_AGE;
                        } else {
                            req.session.cookie.maxAge = globals.COOKIE_MIN_AGE;
                        }
                        globals.logger.info( `${routeHeader} :: Users.id=${user.id} logged IN` );

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
    // user/logout
    .get('/logout', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /user/logout";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN`);

            if( req.session && req.session.isLoggedIn ){
                //delete the session
                req.session.destroy()

                return res.redirect('/user/login');
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
        globals.logger.info( "POST /user/signup :: globals? ", gres );
        return res.json({ page: 'POST /user/signup'});
    })
    // create user
    .post('/', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "POST /user";

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

            Users.create(createParams, (err, new_user_id) => {
                if(err && err.error_type == "user") {
                    res.status(400);
                    return next(err);
                } else if(err) {
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: Users created: ${new_user_id}` );

                /*
                //now send some emails
                globals.logger.info( `${routeHeader} :: Send registration email...` );

                let regEmail = globals.is_admin_registration_email({ user: createParams })

                //send regristration email
                let email = {
                    to: createParams.email_address,
                    from: `${process.env.is_admin_EMAIL}`,
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
                    from: `${process.env.is_admin_EMAIL}`,
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
     // user/newpassword
    .get('/newpassword', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /user/newpassword";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {
            globals.logger.debug( `${routeHeader} :: id:: ${req.session.user.id} :: needsNewpassword :: ${req.session.needsNewpassword}`);

            if(!req.session.needsNewpassword){

                globals.logger.debug( `${routeHeader} :: Does not need new password :: END`);

                return res.redirect('/user/login');
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
     // user/newpassword
    .post('/newpassword', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "POST /user/newpassword";

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

                Users.update(updateParams, (err, dbres) => {
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
     // user/confirm/:id/:token
    .get('/confirm/:id/:token', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /user/confirm/:id/:token";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {

            globals.logger.debug( `${routeHeader} :: id:: ${req.params.id} :: token :: ${req.params.token}`);

            let tokenParams = {
                id: parseInt(req.params.id),
                token: req.params.token
            };

            Users.confirmRegistration(tokenParams, (err, dbres) => {
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
                    return res.redirect('/user/newpassword');
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
    // user/:id operations
    .get('/:id', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /user/:id";

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get user
            Users.findOne({ id: parseInt(req.params.id) }, (err, user) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.debug(`GET /user/:id :: user.id: ${req.params.id}`, user);

                globals.logger.debug( `${routeHeader} :: END` );

                return res.json(user);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/:id', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "PUT /user/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let user = req.body;
            delete user._csrf;
            let updateParams = { id: parseInt(req.params.id), user: req.body };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            Users.update(updateParams, (err, dbres) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                let user = dbres[1];
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
        let Users = new UsersModel( globals );
        let routeHeader = "DELETE /user/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            Users.delete( parseInt(req.params.id), (err, deleteRes) => {
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