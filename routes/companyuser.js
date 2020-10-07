//companyuser routes

let express = require('express');
let router = express.Router();

const uuid = require('uuid');
const bcrypt = require('bcrypt');

// // companyuser/login
// router.post('/login', (req, res) =>{
//     if( !req.body ){
//         return res.status(400).json({reason: "no_params_sent"});
//     } else if (!req.body.email){
//         return res.status(400).json({ reason: "no_email" });
//     } else if (!req.body.password){
//         return res.status(400).json({ reason: "no_password" });
//     }

//     let userEmail = { email: req.body.email };
//     CompanyUser.find(userEmail, (err,user) => {
//         if(err){
//             globals.logger.info( "DB CompanyUser.find() error: ", err);
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
//                 globals.logger.info( "CompanyUser logged IN" );
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

let CompanyUserModel = require('../models/PoppitCompanyUsers');

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

        globals.logger.info( "GET /companyuser/login" );

        return res.render('pages/login', {
            data: {
                pageTitle: process.env.APP_NAME + ' | Login'
            },
            layout: 'login_layout'
        });
    })
    // companyuser/login
    .post('/login', (req, res, next) => {
        let gres = (globals.logger == undefined )? true : false;
        globals.logger.info( "POST /companyuser/login :: globals? ", gres );
        return res.json({ page: 'POST /companyuser/login'});
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