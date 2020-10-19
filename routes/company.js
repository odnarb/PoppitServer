//company routes

let express = require('express');
let router = express.Router();

let CompanyModel = require('../models/PoppitCompanies');

module.exports = (globals) => {
    return router
    // /company (get all companies)
    .get('/setcontext/:id', (req, res, next) => {
        let Company = new CompanyModel( globals );
        let routeHeader = "GET /setcontext/:id";

        try {
            globals.logger.debug( `${routeHeader} :: BEGIN` );

            globals.logger.debug( `${routeHeader} :: company id: ${req.params.id}` );

            globals.logger.debug( `${routeHeader} :: user: `, req.session.user );

            if(req.session.user.admin === 1){
                globals.logger.debug( `${routeHeader} :: BEFORE Company.findOne() :: company id: ${req.params.id}` );

                Company.findOne({ id: parseInt(req.params.id) }, (err, dbRes) => {
                    if(err){
                        res.status(500);
                        return next(err);
                    }

                    globals.logger.debug( `${routeHeader} :: AFTER Company.findOne() :: dbRes:`, dbRes);

                    globals.logger.debug( `${routeHeader} :: AFTER Company.findOne() :: req.session:`, req.session);

                    let context_res = { success: false }
                    if( dbRes !== undefined ){
                        globals.logger.debug( `${routeHeader} :: NEW req.session.company_context:`, req.session.company_context);

                        req.session.company_context = dbRes;
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
    .get('/', (req, res, next) => {
        let Company = new CompanyModel( globals );
        let routeHeader = "GET /company (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /company (XHR)";


            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered company list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                //later filter or sort on the # of locations
                //later filter or sort on the # of compaigns

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get companies
                Company.find(req.query, (err, companies) => {
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
                return res.render('pages/company',{
                    pageTitle: `${process.env.APP_NAME} | Search Companies`
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    //create company
    .post('/', (req, res, next) => {
        let Company = new CompanyModel( globals );
        let routeHeader = "POST /company";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            Company.create(createParams, (err, new_company_id) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: Company created: ${new_company_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, company_id: new_company_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // company/:id operations
    .get('/:id', (req, res, next) => {
        let Company = new CompanyModel( globals );
        let routeHeader = "GET /company/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get company
            Company.findOne({ id: parseInt(req.params.id) }, (err, company) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /company/:id :: company.id: ${req.params.id}`, company);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(company);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/:id', (req, res, next) => {
        let Company = new CompanyModel( globals );
        let routeHeader = "PUT /company/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let updateParams = { id: parseInt(req.params.id), company: req.body };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            Company.update(updateParams, (err, company) => {
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
        let Company = new CompanyModel( globals );
        let routeHeader = "DELETE /company/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            Company.delete( parseInt(req.params.id), (err, deleteRes) => {
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
