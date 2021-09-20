//admin routes

let express = require('express');
let router = express.Router();

const uuid = require('uuid');
const bcrypt = require('bcrypt');

let CompanyCampaignModel = require('../models/CompanyCampaigns');
let CompanyLocationModel = require('../models/CompanyLocations');
let UserCompaniesModel   = require('../models/UserCompanies');
let UsersModel           = require('../models/Users');
let GamesModel           = require('../models/Games');

module.exports = (globals) => {
    return router

    // start campaign operations
    .get('/campaigns', (req, res, next) => {
       let Campaign = new CompanyCampaignModel( globals );
        let routeHeader = "GET /campaigns (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /campaigns (XHR)";

            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered campaign list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                //later filter or sort on the # of locations
                //later filter or sort on the # of compaigns

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get campaigns
                Campaign.find(req.query, (err, campaigns) => {
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
                        aaData: campaigns[0],
                        iTotalRecords: campaigns[1].totalCount,
                        iTotalDisplayRecords: campaigns[2].totalCountWithFilter
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
                return res.render('pages/admin-campaigns',{
                    pageTitle: "Campaigns"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    .post('/campaigns', (req, res, next) => {
        let Campaign = new CompanyCampaignModel( globals );
        let routeHeader = "POST /campaign";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            //format dates properly
            createParams.date_start = new Date(createParams.date_start);
            createParams.date_end = new Date(createParams.date_end);

            delete createParams._csrf;

            Campaign.create(createParams, (err, new_campaign_id) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: Campaign created: ${new_campaign_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, campaign_id: new_campaign_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .get('/campaigns/:id', (req, res, next) => {
        let Campaign = new CompanyCampaignModel( globals );
        let routeHeader = "GET /campaign/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get campaign
            Campaign.findOne({ id: parseInt(req.params.id) }, (err, campaign) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /campaign/:id :: campaign.id: ${req.params.id}`, campaign);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(campaign);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/campaigns/:id', (req, res, next) => {
        let Campaign = new CompanyCampaignModel( globals );
        let routeHeader = "PUT /campaign/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let campaign = req.body;

            //format dates properly
            campaign.date_start = new Date(campaign.date_start);
            campaign.date_end = new Date(campaign.date_end);

            delete campaign._csrf;

            let updateParams = { id: parseInt(req.params.id), campaign: campaign };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            Campaign.update(updateParams, (err, campaign) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true, campaign: campaign });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .delete('/campaigns/:id', (req, res, next) => {
        let Campaign = new CompanyCampaignModel( globals );
        let routeHeader = "DELETE /campaign/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            Campaign.delete( parseInt(req.params.id), (err, deleteRes) => {
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
    // end campaign operations

    // start location operations
    .get('/locations', (req, res, next) => {
       let Location = new CompanyLocationModel( globals );
        let routeHeader = "GET /location (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /location (XHR)";

            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered location list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                //later filter or sort on the # of locations
                //later filter or sort on the # of compaigns

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get locations
                Location.find(req.query, (err, locations) => {
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
                        aaData: locations[0],
                        iTotalRecords: locations[1].totalCount,
                        iTotalDisplayRecords: locations[2].totalCountWithFilter
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
                return res.render('pages/admin-locations',{
                    pageTitle: "Locations"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    .post('/locations', (req, res, next) => {
        let Location = new CompanyLocationModel( globals );
        let routeHeader = "POST /location";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            //format dates properly
            createParams.date_start = new Date(createParams.date_start);
            createParams.date_end = new Date(createParams.date_end);

            delete createParams._csrf;

            Location.create(createParams, (err, new_location_id) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: Location created: ${new_location_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, location_id: new_location_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .get('/locations/:id', (req, res, next) => {
        let Location = new CompanyLocationModel( globals );
        let routeHeader = "GET /location/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get location
            Location.findOne({ id: parseInt(req.params.id) }, (err, location) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /location/:id :: location.id: ${req.params.id}`, location);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(location);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/locations/:id', (req, res, next) => {
        let Location = new CompanyLocationModel( globals );
        let routeHeader = "PUT /locations/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let location = req.body;

            delete location._csrf;

            let updateParams = { id: parseInt(req.params.id), location: location };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            Location.update(updateParams, (err, location) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true, location: location });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .delete('/locations/:id', (req, res, next) => {
        let Location = new CompanyLocationModel( globals );
        let routeHeader = "DELETE /locations/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            Location.delete( parseInt(req.params.id), (err, deleteRes) => {
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
    // end location operations

    // start company operations
    .get('/companies', (req, res, next) => {
        let UserCompanies = new UserCompaniesModel( globals );
        let routeHeader = "GET /companies (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /companies (XHR)";

            try {
                globals.logger.info( `${routeHeader} :: BEGIN :: filtered company list` );

                // globals.logger.info( `${routeHeader} :: req.params: `, req.params );
                // globals.logger.info( `${routeHeader} :: req.query: `, req.query );
                // globals.logger.info( `${routeHeader} :: req.body: `, req.body );

                //later filter or sort on the # of locations
                //later filter or sort on the # of compaigns

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                if( !req.session.user.is_admin && req.session.user.is_support ) {
                    params.where = {
                        active: 1
                    }
                }

                //get companies
                UserCompanies.find(req.query, (err, companies) => {
                    if(err && err.error_type === "system"){
                        globals.logger.debug( `${routeHeader} :: DB ERROR: `, err);
                        res.status(500);
                        return next(err);
                    } else if( err && err.error_type === "user"){
                        globals.logger.debug( `${routeHeader} :: User DB ERROR: `, err);
                        res.status(400);
                        return next(err);
                    }
                    globals.logger.debug( `${routeHeader} :: dbRes: `, companies);
                    globals.logger.debug( `${routeHeader} :: DONE`);

                    return res.json({
                        aaData: companies[0],
                        iTotalRecords: companies[1].totalCount,
                        iTotalDisplayRecords: companies[2].totalCountWithFilter
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
                return res.render('pages/admin-companies',{
                    pageTitle: "Companies"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    // /companies (get all companies)
    .get('/companies', (req, res, next) => {
        let UserCompanies = new UserCompaniesModel( globals );
        let routeHeader = "GET /companies (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /companies (XHR)";

            try {
                globals.logger.info( `${routeHeader} :: BEGIN :: filtered company list` );

                // globals.logger.info( `${routeHeader} :: req.params: `, req.params );
                // globals.logger.info( `${routeHeader} :: req.query: `, req.query );
                // globals.logger.info( `${routeHeader} :: req.body: `, req.body );

                //later filter or sort on the # of locations
                //later filter or sort on the # of compaigns

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                if( !req.session.user.is_admin && req.session.user.is_support ) {
                    params.where = {
                        active: 1
                    }
                }

                //get companies
                UserCompanies.find(req.query, (err, companies) => {
                    if(err && err.error_type === "system"){
                        globals.logger.debug( `${routeHeader} :: DB ERROR: `, err);
                        res.status(500);
                        return next(err);
                    } else if( err && err.error_type === "user"){
                        globals.logger.debug( `${routeHeader} :: User DB ERROR: `, err);
                        res.status(400);
                        return next(err);
                    }
                    globals.logger.debug( `${routeHeader} :: dbRes: `, companies);
                    globals.logger.debug( `${routeHeader} :: DONE`);

                    return res.json({
                        aaData: companies[0],
                        iTotalRecords: companies[1].totalCount,
                        iTotalDisplayRecords: companies[2].totalCountWithFilter
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
                return res.render('pages/admin-companies',{
                    pageTitle: "Companies"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    .post('/companies', (req, res, next) => {
        let UserCompanies = new UserCompaniesModel( globals );
        let routeHeader = "POST /companies";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            //set this company to be owned by the current user
            createParams.user_id = req.session.user.id
            createParams.active = 1
            createParams.country = "United States"
            createParams.country_code = "US"

            delete createParams._csrf;

            UserCompanies.create(createParams, (err, new_company_id) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: UserCompanies created: ${new_company_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, company_id: new_company_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .get('/companies/:id', (req, res, next) => {
        let UserCompanies = new UserCompaniesModel( globals );
        let routeHeader = "GET /companies/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get company
            UserCompanies.findOne({ id: parseInt(req.params.id) }, (err, company) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /companies/:id :: company.id: ${req.params.id}`, company);

                globals.logger.info( `${routeHeader} :: END` );

                if( company === undefined ) {
                    return res.json({})
                } else {
                    return res.json(company);
                }
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/companies/:id', (req, res, next) => {
        let UserCompanies = new UserCompaniesModel( globals );
        let routeHeader = "PUT /companies/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let company = req.body;
            delete company._csrf;
            let updateParams = { id: parseInt(req.params.id), company: company };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            UserCompanies.update(updateParams, (err, company) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true, company: company });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .delete('/companies/:id', (req, res, next) => {
        let UserCompanies = new UserCompaniesModel( globals );
        let routeHeader = "DELETE /companies/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            UserCompanies.delete( parseInt(req.params.id), (err, deleteRes) => {
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
    //end company operations

    //start games operations
    .get('/games', (req, res, next) => {
        let Games = new GamesModel( globals );
        let routeHeader = "GET /games (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /games (XHR)";

            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered games list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get games
                Games.find(req.query, (err, dbresult) => {

                    globals.logger.debug( `${routeHeader} :: DB CB: `, err);

                    if(err && err.error_type === "system"){
                        globals.logger.debug( `${routeHeader} :: DB ERROR: `, err);
                        res.status(500);
                        return next(err);
                    } else if( err && err.error_type === "user"){
                        globals.logger.debug( `${routeHeader} :: Games DB ERROR: `, err);
                        res.status(400);
                        return next(err);
                    }
                    globals.logger.debug( `${routeHeader} :: DONE`);
                    return res.json({
                        aaData: dbresult[0],
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
                return res.render('pages/admin-games',{
                    pageTitle: "Games"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    .delete('/games/:id', (req, res, next) => {
        let Games = new GamesModel( globals );
        let routeHeader = "DELETE /games/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            Games.delete( parseInt(req.params.id), (err, deleteRes) => {
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
    // create game
    .post('/games/', (req, res, next) => {
        let Games = new GamesModel( globals );
        let routeHeader = "POST /games";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            delete createParams._csrf;

            Games.create(createParams, (err, new_game_id) => {
                if(err && err.error_type == "user") {
                    res.status(400);
                    return next(err);
                } else if(err) {
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: Game created: ${new_game_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, game_id: new_game_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .get('/games/:id', (req, res, next) => {
        let Games = new GamesModel( globals );
        let routeHeader = "GET /games/:id";

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: id: ${req.params.id} :: ` );

            globals.logger.debug( `${routeHeader} :: parseInt(req.params.id): ${parseInt(req.params.id)}` );

            if( req.params.id === undefined || isNaN( parseInt(req.params.id) ) ){
                res.status(404)
                return next()
            }

            //get game
            Games.findOne({ id: parseInt(req.params.id) }, (err, game) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.debug(`GET /games/:id :: game.id: ${req.params.id}`, game);

                globals.logger.debug( `${routeHeader} :: END` );

                return res.json(game);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/games/:id', (req, res, next) => {
        let Games = new GamesModel( globals );
        let routeHeader = "PUT /games/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let game = req.body;
            delete game._csrf;
            let updateParams = { id: parseInt(req.params.id), game: req.body };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            Games.update(updateParams, (err, dbres) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                let game = dbres[1];
                globals.logger.debug( `${routeHeader} :: game ::`, game);

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true, game: game });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    //end games operations

    //start reports pages
    .get('/reports', (req, res, next) => {
        let routeHeader = "GET /admin/reports";

        globals.logger.debug( `${routeHeader} :: BEGIN`);

        try {

            globals.logger.debug( `${routeHeader} :: DONE`);

            return res.render('pages/dashboard', {
                pageTitle: "Reports"
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    //end reports pages

    //start user operations
    .get('/users', (req, res, next) => {
        let Users = new UsersModel( globals );
        let routeHeader = "GET /users (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /users (XHR)";

            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered user list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get users
                Users.find(req.query, (err, dbresult) => {

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
                        aaData: dbresult[0],
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
                return res.render('pages/admin-users',{
                    pageTitle: "Users"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    .delete('/users/:id', (req, res, next) => {
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
    .post('/users/', (req, res, next) => {
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
    .get('/users/:id', (req, res, next) => {
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
    .put('/users/:id', (req, res, next) => {
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
    //end user operations
};