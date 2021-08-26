//user routes

let express = require('express');
let router = express.Router();

const uuid = require('uuid');
const bcrypt = require('bcrypt');

let UsersModel = require('../models/Users');
let UserNotificationsModel = require('../models/UserNotifications');

module.exports = (globals) => {
    return router
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
                return res.render('pages/users',{
                    pageTitle: "Users"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
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
    .get('/forgotpassword/:id/:token', (req,res,next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /forgotpassword/:id/:token";

        globals.logger.debug(`${routeHeader} :: req.params: `, req.params);

        //check id && token, and set to needs pw change for
            //this session until the pw change has taken place
        if( req.params.id !== '' && req.params.token !== '' ){
            let opts = {
                id: parseInt( req.params.id ),
                token: req.params.token
            }
            Users.findForgotPW(opts, (err, dbRes) => {
                if(err){
                    globals.logger.debug( `${routeHeader} :: DB user.login() error: `, err);
                    return res.status(500).json({reason: "server_error"});
                }

                globals.logger.debug(`${routeHeader} :: dbRes`, dbRes);

                if( dbRes === undefined || dbRes.id <= 0 ) {
                    globals.logger.debug(`${routeHeader} :: ForgotPW dbRes is undefined.. redirecting..`);
                    return res.redirect('/')
                }

                globals.logger.debug(`${routeHeader} :: req.session: `, req.session);

                //set some parameters to remember this user while resetting their password
                req.session.isLoggedIn = false;
                req.session.user_id = dbRes.id
                req.session.needsNewpassword = true;

                globals.logger.debug(`${routeHeader} :: req.session: `, req.session);

                return res.redirect('/user/newpassword')
            })
        }
    })
    // user/forgotpassword
    .post('/forgotpassword', (req, res, next) => {
        let Users = new UsersModel( globals );
        let userNotification = new UserNotificationsModel( globals );
        let routeHeader = "POST /user/forgotpassword";

        try {

            globals.logger.debug( `${routeHeader} :: req.body `, req.body);

            let email_address = req.body.email_address || ""

            if( email_address !== "" ){
                //try to find it and generate a forgot pw token
                let opts = {
                    email_address: email_address.toLowerCase()
                }
                Users.forgotPW( opts, (err, dbRes) => {
                    if(err){
                        globals.logger.debug( `${routeHeader} :: DB user.login() error: `, err);
                        return res.status(500).json({reason: "server_error"});
                    }

                    globals.logger.debug(`${routeHeader} :: user.forgotPW() :: dbRes`, dbRes);

                    if( dbRes.user_id !== undefined
                        && dbRes !== ''
                        && dbRes.forgot_password_token !== undefined
                        && dbRes.forgot_password_token !== '')
                    {
                        let opts = {
                            id: dbRes.user_id,
                            token: dbRes.forgot_password_token
                        }
                        let forgotPWEmail = globals.forgotpw_email(opts)

                        notification = {
                            user_id: dbRes.user_id,
                            notification_type_id: globals.NOTIFICATION_TYPES.forgot_password,
                            notification_method_id: globals.NOTIFICATION_METHODS.email,
                            status: globals.NOTIFICATION_STATUS.PENDING,
                            status_detail: "",
                            to_email: dbRes.email_address,
                            from_email: `${process.env.APP_NAME} Admin <${process.env.ADMIN_EMAIL_FROM}>`,
                            subject: `[${process.env.APP_NAME}] Reset Password`,
                            body_html: forgotPWEmail.html,
                            body_text: forgotPWEmail.text,
                            update_user_id: dbRes.user_id,
                            create_user_id: dbRes.user_id
                        }

                        globals.logger.debug(`${routeHeader} :: Forgot PW email :: email: `, notification);

                        // create a record in the user_notifications table
                        userNotification.create(notification, (err, _userNotifications) => {
                            if(err && err.error_type == "user") {
                                globals.logger.error(`${routeHeader} :: user db error: `, err );
                                return res.json({ success: false })
                            } else if(err) {
                                globals.logger.error(`${routeHeader} :: system db error: `, err );
                                return res.json({ success: false })
                            } else {
                                return res.json({ success: true })
                            }
                        });
                    } else {
                        return res.json({ success: false })
                    }
                })
            } else {
                globals.logger.debug( `${routeHeader} :: failed..`, );
                return res.json({ success: false })
            }
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
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
            globals.logger.debug( `${routeHeader} :: BEGIN:`, req.originalUrl );

            if( !req.body ){
                globals.logger.debug( `${routeHeader} :: ERR 1 `);
                return res.status(400).json({reason: "no_params_sent"});
            } else if (!req.body.email_address){
                globals.logger.debug( `${routeHeader} :: ERR 2`);

                return res.status(400).json({ reason: "no_email" });
            } else if (!req.body.password){
                globals.logger.debug( `${routeHeader} :: ERR 3 `);

                return res.status(400).json({ reason: "no_password" });
            }

            let userEmail = { email_address: req.body.email_address };
            Users.findOne(userEmail, (err,user) => {
                if(err){
                    globals.logger.debug( `${routeHeader} :: DB Users.find() error: `, err);
                    return res.status(500).json({reason: "server_error"});
                }

                //user not found at all
                if ( user === undefined ){
                    globals.logger.debug( `${routeHeader} :: user not found, login denied: `, req.body.email_address);
                    return res.status(403).json({reason: "no_user"});
                }

                if( bcrypt.compareSync(req.body.password, user.password_hash) ){
                    //only check if the passwords match
                    //user has not been activated
                    if( user.active == 0 ){
                        globals.logger.debug( `${routeHeader} :: user inactive, login denied: `, req.body.email_address);
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
    // user/newpassword
    .get('/newpassword', (req, res, next) => {
        let routeHeader = "GET /user/newpassword";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {
            globals.logger.debug( `${routeHeader} :: needsNewpassword :: ${req.session.needsNewpassword}`);

            if(!req.session.needsNewpassword || req.session.needsNewpassword === false){
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
            let validNewpassword = (req.session.user_id !== undefined && req.session.user_id > 0);

            //check password1 and password2
            let pw1 = req.body.password1;
            let pw2 = req.body.password2;

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
                    id: req.session.user_id,
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
    // /user/signup
    .get('/signup', (req, res, next) => {
        let routeHeader = "GET /user/signup";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {
            return res.render('pages/login', {
                pageTitle: "Sign Up",
                showForm: "signup",
                layout: 'login_layout'
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .post('/signup', (req, res, next) => {
        let Users = new UsersModel( globals );
        let UserNotifications = new UserNotificationsModel( globals );

        let routeHeader = "POST /user/signup";

        globals.logger.debug( `${routeHeader} :: BEGIN`);
        globals.logger.debug( `${routeHeader} :: PARAMS (user obj):`, req.body );

        try {
            //try to create a new user from params..
            let createParams = JSON.parse(JSON.stringify(req.body));

            let tmpAddr = createParams.email_address.toLowerCase()
            createParams.email_address = tmpAddr

            //auto-generate a password for the user when created via the panel
            if( createParams.password === createParams.rpassword){
                const salt = bcrypt.genSaltSync(globals.salt_rounds);
                const hash = bcrypt.hashSync( createParams.password, salt);

                //save the password hash
                createParams.password_hash = hash;
            }

            //create a token for first login
            createParams.invite_token = uuid.v4()

            //remove some unneeded items
            delete createParams.password
            delete createParams.rpassword
            delete createParams._csrf
            delete createParams.agree

            createParams.user_type_id = globals.DEFAULT_USER_TYPE

            globals.logger.info(`${routeHeader} :: BEFORE user.signup() :: createParams: `, createParams );

            // dbRes[0] === new_user, and dbRes[1] === group owners array
            Users.signup(createParams, (err, dbRes) => {
                if(err && err.error_type == "user") {
                    globals.logger.error(`${routeHeader} :: user db error: `, err );

                    let reason = "SYSTEM"
                    if( err.error === "DUPLICATE_EMAIL"){
                        reason = "duplicate_email"
                    }
                    return res.status(400).json({ reason: reason });
                } else if(err) {
                    globals.logger.error(`${routeHeader} :: system db error: `, err );
                    res.status(500);
                    return next(err);
                }

                //some simple checks..
                let validDbRres = (
                    dbRes[0].length > 0 &&
                    dbRes[0][0] !== null &&
                    dbRes[0][0].id > 0
                )

                if( validDbRres === false ){
                    globals.logger.error(`${routeHeader} :: validDbRres === false!: dbRes`, dbRes );
                    res.status(400);
                    return next();
                }

                //extract the db result information
                let new_user = dbRes[0][0];
                let owners = dbRes[1];

                globals.logger.info( `${routeHeader} :: user created: ${new_user.id}` );

                console.log("SEND USER REG EMAIL TO:", new_user.email_address)

                globals.logger.info( `${routeHeader} :: Create registration email notification...` );

                new_user.registration_url = req.protocol + '://' + req.get('Host') + req.originalUrl;

                let regEmail = globals.user_registration_email(new_user)

                let notifications = []
                //Email to user
                let notification = {
                    user_id: new_user.id,
                    notification_type_id: globals.NOTIFICATION_TYPES.registration,
                    notification_method_id: globals.NOTIFICATION_METHODS.email,
                    status: globals.NOTIFICATION_STATUS.PENDING,
                    status_detail: "",
                    to_email: new_user.email_address,
                    from_email: `${process.env.APP_NAME} Admin <${process.env.ADMIN_EMAIL_FROM}>`,
                    subject: `[${process.env.APP_NAME}] Please Verify Email Address`,
                    body_html: regEmail.html,
                    body_text: regEmail.text,
                    update_user_id: new_user.id,
                    create_user_id: new_user.id
                }
                notifications.push(notification)

                //Email to admin
                regEmail = globals.admin_registration_email(new_user)
                notification = {
                    user_id: 0,
                    notification_type_id: globals.NOTIFICATION_TYPES.registration,
                    notification_method_id: globals.NOTIFICATION_METHODS.email,
                    status: globals.NOTIFICATION_STATUS.PENDING,
                    status_detail: "",
                    to_email: process.env.ADMIN_EMAIL,
                    from_email: `${process.env.APP_NAME} Admin <${process.env.ADMIN_EMAIL_FROM}>`,
                    subject: `[${process.env.APP_NAME}] New User Registered`,
                    body_html: regEmail.html,
                    body_text: regEmail.text,
                    update_user_id: new_user.id,
                    create_user_id: new_user.id
                }
                notifications.push(notification)

                // create a record in the user_notifications table
                UserNotifications.create(notifications, (err, _userNotifications) => {
                    if(err && err.error_type == "user") {
                        globals.logger.error(`${routeHeader} :: user db error: `, err );
                    } else if(err) {
                        globals.logger.error(`${routeHeader} :: system db error: `, err );
                    }
                });

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, user_id: new_user.id });
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
    // user/:id operations
    .get('/:id', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /user/:id";

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: id: ${req.params.id} :: ` );

            globals.logger.debug( `${routeHeader} :: parseInt(req.params.id): ${parseInt(req.params.id)}` );

            if( req.params.id === undefined || isNaN( parseInt(req.params.id) ) ){
                res.status(404)
                return next()
            }

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
};