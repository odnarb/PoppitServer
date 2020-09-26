//company routes

let express = require('express');
let router = express.Router();

let CompanyModel = require('../models/PoppitCompanies');

router.get('/', function(req, res) {
    let Company = new CompanyModel( req.app.get('db') );

    //get companies
    Company.find({id: 1}, (err, company) => {
        if(err){
            console.log("fetch error: ", err)
            return res.sendError();
        }
        return res.render('pages/company',{
            data: {
                pageTitle: process.env.APP_NAME + ' | Company ID: ' + req.params.id,
                company: company
            }
        });
    });
});

// /company/123
router.get('/:id', (req, res) => {
    return res.render('pages/company',{
        data: {
            pageTitle: process.env.APP_NAME + ' | Company ID: ' + req.params.id
        }
    });
});

module.exports = router;