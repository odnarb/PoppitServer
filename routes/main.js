// main route

let express = require('express');
let router = express.Router();

module.exports = (globals) => {
    main: return router
        //Hackers, nothing here to see, move along
        .post('/', (req, res, next) => {
            //just disable this..
            return res.sendStatus(404);
        })
        //This is the actual request we look for
        .get('/', (req, res) => {
            return res.render('pages/dashboard',{
                data: {
                    pageTitle: process.env.APP_NAME + ' | Dashboard'
                }
            });
        })
};
