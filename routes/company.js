//company routes

let express = require('express');
let router = express.Router();

let CompanyModel = require('../models/PoppitCompanies');

module.exports = (globals) => {
    company: return router
    // /company (get all companies)
    .get('/', (req, res) => {
        if( req.xhr == true ){
            let Company = new CompanyModel( globals );

            //get companies
            Company.find({}, (err, companies) => {
                if(err){
                    globals.logger.error("fetch error: ", err);
                    return res.sendError();
                }

                globals.logger.info("GET /company :: company list: ", companies);

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
    .post('/', (req, res) => {
        globals.logger.info( "POST /company " );
        return res.json({ success: true });
    })
    // company/:id operations
    .get('/:id', (req, res) => {
        let Company = new CompanyModel( globals );

        //get companies
        Company.findOne({ id: parseInt(req.params.id) }, (err, company) => {
            if(err){
                globals.logger.error("fetch error: ", err);
                return res.sendError();
            }

            let gres = (global.logger == undefined )? true : false;
            globals.logger.info( "GET /company/:id :: globals? ", gres );

            globals.logger.info(`GET /company/:id :: company.id: ${req.params.id}`, company);

            return res.render('pages/company',{
                data: {
                    pageTitle: process.env.APP_NAME + ' | Company ID: ' + req.params.id,
                    company: company
                }
            });
        });
    })
    .put('/:id', (req, res) => {
        globals.logger.info( "PUT /company/:id " );
        return res.json({ success: true });
    })
    .delete('/:id', (req, res) => {
        globals.logger.info( "DELETE /company/:id " );
        return res.json({ success: true });
    })
};
