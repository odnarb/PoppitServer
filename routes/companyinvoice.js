//invoice routes

let express = require('express');
let router = express.Router();

let InvoiceModel = require('../models/PoppitInvoices');

module.exports = (globals) => {
    return router
    // /invoice (get all invoices)
    .get('/', (req, res, next) => {
        let Invoice = new InvoiceModel( globals );
        let routeHeader = "GET /invoice (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /invoice (XHR)";


            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered invoice list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get invoices
                Invoice.find(req.query, (err, invoices) => {
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
                        aaData: invoices[0],
                        iTotalRecords: invoices[1].totalCount,
                        iTotalDisplayRecords: invoices[2].totalCountWithFilter
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
                return res.render('pages/invoice',{
                    pageTitle: "Search Invoices"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    // /invoice (get all invoices)
    .get('/generate', (req, res, next) => {
        let Invoice = new InvoiceModel( globals );
        let routeHeader = "GET /invoice/generate (XHR)";

        globals.logger.debug( `${routeHeader} :: BEGIN :: filtered invoice list` );

        if( req.xhr == true ){
            try {
                //get invoices
                Invoice.generate( (err, dbRes) => {
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
                        aaData: invoices[0],
                        iTotalRecords: invoices[1].totalCount,
                        iTotalDisplayRecords: invoices[2].totalCountWithFilter
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
                return res.render('pages/invoice',{
                    pageTitle: "Search Invoices"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    //create invoice
    .post('/', (req, res, next) => {
        let Invoice = new InvoiceModel( globals );
        let routeHeader = "POST /invoice";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            delete createParams._csrf;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            Invoice.create(createParams, (err, new_invoice_id) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: Invoice created: ${new_invoice_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, invoice_id: new_invoice_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // invoice/:id operations
    .get('/:id', (req, res, next) => {
        let Invoice = new InvoiceModel( globals );
        let routeHeader = "GET /invoice/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get invoice
            Invoice.findOne({ id: parseInt(req.params.id) }, (err, invoice) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /invoice/:id :: Invoice.id: ${req.params.id}`, invoice);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(invoice);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    /*
    .put('/:id', (req, res, next) => {
        let Invoice = new InvoiceModel( globals );
        let routeHeader = "PUT /invoice/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let invoice = req.body;

            delete invoice._csrf;

            let updateParams = { id: parseInt(req.params.id), invoice: invoice };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            Invoice.update(updateParams, (err, invoice) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true, invoice: invoice });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .delete('/:id', (req, res, next) => {
        let Invoice = new InvoiceModel( globals );
        let routeHeader = "DELETE /invoice/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            Invoice.delete( parseInt(req.params.id), (err, deleteRes) => {
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
    */
};
