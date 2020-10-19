// main route

let express = require('express');
let router = express.Router();

module.exports = (globals) => {
    return router
        //This is the actual request we look for
        .get('/', (req, res) => {
            return res.render('pages/dashboard',{
                data: {
                    pageTitle: `${process.env.APP_NAME} | Dashboard`
                }
            });
        });
};
