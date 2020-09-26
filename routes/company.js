//company routes

let express = require('express');
let router = express.Router();

let CompanyModel = require('../models/PoppitCompanies');

// router.get('/', function(req, res) {
//     let Company = new CompanyModel( req.app.get('db') );

//     //get companies
//     Company.find({id: 1}, (err, company) => {
//         if(err){
//             console.log("fetch error: ", err)
//             return res.sendError();
//         }
//         return res.render('pages/company',{
//             data: {
//                 pageTitle: process.env.APP_NAME + ' | Company ID: ' + req.params.id,
//                 company: company
//             }
//         });
//     });
// });

// // /company/123
// router.get('/:id', (req, res) => {
//     return res.render('pages/company',{
//         data: {
//             pageTitle: process.env.APP_NAME + ' | Company ID: ' + req.params.id
//         }
//     });
// });

module.exports = (globals) => {
    company: return router
    // /company (get all companies)
    .get('/', (req, res) => {
        let Company = new CompanyModel( globals );

        //get companies
        Company.find({}, (err, companies) => {
            if(err){
                globals.logger.error("fetch error: ", err);
                return res.sendError();
            }

            globals.logger.info("GET /company :: company list: ", companies);

            return res.render('pages/company',{
                data: {
                    pageTitle: process.env.APP_NAME + ' | Search Companies',
                    companies: companies
                }
            });
        });
    })
    // company/:id
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
};