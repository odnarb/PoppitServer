//profile routes

let express = require('express');
let router = express.Router();

const uuid = require('uuid');
const bcrypt = require('bcrypt');
const fs = require('fs');

let UsersModel = require('../models/Users');
let UserNotificationsModel = require('../models/UserNotifications');

module.exports = (globals) => {
    return router
    .get('/view/:id', (req, res, next) => {
        let user = new UsersModel( globals );
        let routeHeader = "GET /profile/view/:id";

        try {
            if( req.session.user.id !== req.params.id &&
                !req.session.user.is_admin  &&
                !req.session.user.is_support )
            {
                return res.redirect('/')
            }

            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: req.params.id: ${req.params.id}` );

            //get user
            user.findOne({ id: parseInt(req.params.id) }, (err, user) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                if( !user || user.id === undefined ){
                    res.status(404)
                    return next()
                }

                vuser_copy = JSON.parse(JSON.stringify(user))

                //remove leading slashes
                let realImagePath = process.cwd() + "/data/" + vuser_copy.profile_picture.replace(/^\/+/, '');

                if( !fs.existsSync( realImagePath ) ){
                    vuser_copy.profile_picture = "/assets/profile/profile-pic.jpg"
                }

                //don't let this data goto the view regardless of admin/support status
                delete vuser_copy.password_hash
                delete vuser_copy.forgot_password_token
                delete vuser_copy.invite_token

                //remove sensitive info if not admin
                if(!req.session.user.is_admin && !req.session.user.is_support ){
                    delete vuser_copy.is_admin
                    delete vuser_copy.is_support
                    delete vuser_copy.active
                    delete vuser_copy.verified
                    delete vuser_copy.needs_pw_change
                }

                globals.logger.info( `${routeHeader} :: user.id: ${req.params.id}`, vuser_copy);

                globals.logger.info( `${routeHeader} :: END` );

                return res.render('pages/profile-view', {
                    pageTitle: `View User: ${vuser_copy.first_name} ${vuser_copy.last_name}`,
                    vuser: vuser_copy
                });
            })
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .get('/edit/:id', (req, res, next) => {
        let user = new UsersModel( globals );
        let routeHeader = "GET /profile/edit/:id";

        try {
            if( req.session.user.id !== parseInt(req.params.id) &&
                !req.session.user.is_admin  &&
                !req.session.user.is_support )
            {
                return res.redirect('/')
            }

            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: req.params.id: ${req.params.id}` );

            //get user
            user.getUser({ id: parseInt(req.params.id), email_address: "" }, (err, user) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                if( !user || user.id === undefined ){
                    res.status(404)
                    return next()
                }

                globals.logger.info(`${routeHeader} :: user.id: ${req.params.id}`, user);

                let vuser_copy = JSON.parse(JSON.stringify(user))

                //remove leading slashes
                // let realImagePath = process.cwd() + "/data/" + globals.USER_UPLOADS_PATH.replace(/^\/+/, '') + vuser_copy.profile_picture.replace(/^\/+/, '');
                let realImagePath = process.cwd() + "/data/";

                if( !fs.existsSync( realImagePath ) ){
                    vuser_copy.profile_picture = "/assets/profile/profile-pic.jpg"
                }

                globals.logger.info( `${routeHeader} :: vuser: `, vuser_copy );

                return res.render('pages/profile-edit', {
                    pageTitle: `Edit User: ${user.first_name} ${user.last_name}`,
                    vuser: JSON.parse(JSON.stringify(vuser_copy))
                });
            })
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .post('/edit/:id', (req, res, next) => {
        let user = new UsersModel( globals );
        let routeHeader = "POST /profile/edit/:id";

        try {
            if( req.session.user.id !== parseInt(req.params.id) &&
                !req.session.user.is_admin  &&
                !req.session.user.is_support )
            {
                return res.status(403).json({ success: false })
            }

            globals.logger.debug( `${routeHeader} :: BEGIN` );
            globals.logger.debug( `${routeHeader} :: req.files: `, req.files);
            globals.logger.debug( `${routeHeader} :: req.body: `, req.body);

            user.getUser({ id: parseInt(req.params.id), email_address: "" }, (err, vuser) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                if( !vuser || vuser.id === undefined ){
                    res.status(404)
                    return next()
                }

                let userUpdateObj = JSON.parse(JSON.stringify(req.body))

                //don't let this data get modified regardless of admin/support status
                delete userUpdateObj.password_hash
                delete userUpdateObj.forgot_password_token
                delete userUpdateObj.invite_token
                delete userUpdateObj.email_address

                //remove sensitive info if not admin
                if(!req.session.user.is_admin && !req.session.user.is_support ){
                    delete userUpdateObj.is_admin
                    delete userUpdateObj.is_support
                    delete userUpdateObj.active
                    delete userUpdateObj.verified
                    delete userUpdateObj.needs_pw_change
                }

                let updateParams = {
                    id: parseInt(req.params.id),
                    user: userUpdateObj
                };

                globals.logger.debug( `${routeHeader} :: before user update`, updateParams);

                user.update(updateParams, (err, dbres) => {
                    if(err){
                        res.status(500);
                        return next(err);
                    }

                    if( dbres[0].changedRows > 0 ){
                        globals.logger.debug( `${routeHeader} :: user updated!`)
                        return res.redirect('/user/view/' + vuser.id)
                    } else {
                        globals.logger.debug( `${routeHeader} :: ERROR :: id:: ${req.params.id}`);

                        //invalid request
                        res.status(400);
                        return next()
                    }
                })
            })
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .post('/media/upload/:id', (req, res, next) => {
        let user = new UsersModel( globals );
        let user_files = new UserFilesModel( globals );

        let routeHeader = "POST /profile/media/upload/:id";

        try {
            if( req.session.user.id !== parseInt(req.params.id) &&
                !req.session.user.is_admin  &&
                !req.session.user.is_support )
            {
                return res.status(403).json({ message: "Access Denied" })
            }

            globals.logger.debug( `${routeHeader} :: BEGIN` );
            globals.logger.debug( `${routeHeader} :: req.files: `, req.files);
            globals.logger.debug( `${routeHeader} :: req.body: `, req.body);

            //only accept certain image mimetypes
                // mimetype: 'image/jpeg',
                // mimetype: 'image/png',

            user.getUser({ id: parseInt(req.params.id), email_address: "" }, (err, vuser) => {
                if(err){
                    globals.logger.debug( `${routeHeader} :: CAUGHT 500?: `, vuser );
                    res.status(500);
                    return next(err);
                }

                if( !vuser || vuser.id === undefined ){
                    globals.logger.debug( `${routeHeader} :: CAUGHT 404?: `, vuser );
                    res.status(404).json({ message: "User Not Found" })
                }

                let filesKey = ""
                if( req.files !== null && req.files.picture_add !== undefined ) {
                    filesKey = "picture_add"
                } else if( req.files !== null && req.files.video_add !== undefined ) {
                    filesKey = "video_add"
                } else {
                    res.status(400).json({ reason: "No file uploaded" })
                }

                // status == PENDING (unprocessed)
                let mediaObj = {
                    user_id: vuser.id,
                    status: globals.MEDIA_FILE_STATUS.PENDING,
                    filetype: req.files[filesKey].mimetype
                }

                //move from temp to primary data folder
                mediaObj.tempFilePath = req.files[filesKey].tempFilePath
                mediaObj.fullFilePath = process.cwd() + "/data" + globals.USER_UPLOADS_PATH + vuser.data.upload_folder.replace(/^\/+/, '') + "/" + req.files[filesKey].name
                mediaObj.userFilePath = globals.USER_UPLOADS_PATH + vuser.data.upload_folder.replace(/^\/+/, '') + "/" + req.files[filesKey].name

                user_files.create(mediaObj, (err, dbRes) => {
                    if(err){
                        return res.status(500).json({ message: "Server Error" })
                    }

                    if( dbRes <= 0 ){
                        return res.status(400).json({reason: "upload_failed"});
                    } else {
                        return res.json({ success: true })
                    }
                })
            })
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
}