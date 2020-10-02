//company routes

let express = require('express');
let router = express.Router();

let CompanyModel = require('../models/PoppitCompanies');

module.exports = (globals) => {
    return router
    // /company (get all companies)
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

                //remove timestamp param
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
                    return res.json({ aaData: companies });
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
        try {
            let Company = new CompanyModel( globals );

            let routeHeader = "POST /company";
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
        try {
            let Company = new CompanyModel( globals );

            let routeHeader = "GET /company/:id";
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get companies
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
        try {
            let Company = new CompanyModel( globals );
            let routeHeader = "PUT /company/:id ";

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
        try {
            let Company = new CompanyModel( globals );

            let routeHeader = "DELETE /company/:id ";
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
