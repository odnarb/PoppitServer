//companies routes

let express = require('express');
let router = express.Router();

let UserCompaniesModel = require('../models/UserCompanies');

module.exports = (globals) => {
    return router
    // /companies (get all companies)
    .get('/', (req, res, next) => {
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
                return res.render('pages/user_companies',{
                    pageTitle: "Search Companies"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    //create company
    .post('/', (req, res, next) => {
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
    // companies/:id operations
    .get('/:id', (req, res, next) => {
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

                return res.json(company);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/:id', (req, res, next) => {
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
    .delete('/:id', (req, res, next) => {
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
    });
};