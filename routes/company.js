//company routes

let express = require('express');
let router = express.Router();

let CompanyModel = require('../models/PoppitCompanies');

module.exports = (globals) => {
    return router
    // /company (get all companies)
    .get('/', (req, res, next) => {
        if( req.xhr == true ){
            let Company = new CompanyModel( globals );

            globals.logger.info("GET /company :: filtered company list");

            //later filter or sort on the # of locations
            //later filter or sort on the # of compaigns

            //get companies
            Company.find(req.query, (err, companies) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                return res.json({ companies: companies });
            });
        } else {
            globals.logger.info("GET /company :: main page ");

            return res.render('pages/company',{
                data: {
                    pageTitle: process.env.APP_NAME + ' | Search Companies'
                }
            });
        }
    })
    //create company
    .post('/', (req, res, next) => {
        let Company = new CompanyModel( globals );

        let routeHeader = "POST /company ";
        globals.logger.info( routeHeader  + " :: BEGIN" );

        let createParams = req.body;

        globals.logger.info(`${routeHeader} :: createParams: `, createParams );

        Company.create(createParams, (err, new_company_id) => {
            if(err){
                res.status(500);
                return next(err);
            }

            globals.logger.info( routeHeader  + " :: END" );
            return res.json({ success: true, company_id: new_company_id });
        });
    })
    // company/:id operations
    .get('/:id', (req, res, next) => {
        let Company = new CompanyModel( globals );

        //get companies
        Company.findOne({ id: parseInt(req.params.id) }, (err, company) => {
            if(err){
                res.status(500);
                return next(err);
            }

            globals.logger.info(`GET /company/:id :: company.id: ${req.params.id}`, company);
            return res.json(company);
        });
    })
    .put('/:id', (req, res, next) => {
        let Company = new CompanyModel( globals );

        let routeHeader = "PUT /company/:id ";
        globals.logger.info( routeHeader  + " :: BEGIN" );

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
    })
    .delete('/:id', (req, res, next) => {
        let Company = new CompanyModel( globals );

        let routeHeader = "DELETE /company/:id ";
        globals.logger.info( routeHeader  + " :: BEGIN" );

        globals.logger.info( routeHeader + ` :: id: ${req.params.id} :: ` );

        Company.delete( parseInt(req.params.id), (err, deleteRes) => {
            if(err){
                res.status(500);
                return next(err);
            }
            globals.logger.info( routeHeader  + " :: res", deleteRes );

            globals.logger.info( routeHeader  + " :: END" );
            return res.json({ success: true });
        });
    });
};
