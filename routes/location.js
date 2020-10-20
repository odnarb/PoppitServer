//location routes

let express = require('express');
let router = express.Router();

let LocationModel = require('../models/PoppitLocations');

module.exports = (globals) => {
    return router
    // /location (get all locations)
    .get('/', (req, res, next) => {
        let Location = new LocationModel( globals );
        let routeHeader = "GET /location (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /location (XHR)";


            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered location list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get locations
                Location.find(req.query, (err, locations) => {
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
                        aaData: locations[0],
                        iTotalRecords: locations[1].totalCount,
                        iTotalDisplayRecords: locations[2].totalCountWithFilter
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
                return res.render('pages/location',{
                    pageTitle: "Search Locations"
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    //create location
    .post('/', (req, res, next) => {
        let Location = new LocationModel( globals );
        let routeHeader = "POST /location";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            Location.create(createParams, (err, new_location_id) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: Location created: ${new_location_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, location_id: new_location_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // location/:id operations
    .get('/:id', (req, res, next) => {
        let Location = new LocationModel( globals );
        let routeHeader = "GET /location/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get location
            Location.findOne({ id: parseInt(req.params.id) }, (err, location) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /location/:id :: Location.id: ${req.params.id}`, location);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(location);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/:id', (req, res, next) => {
        let Location = new LocationModel( globals );
        let routeHeader = "PUT /location/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let updateParams = { id: parseInt(req.params.id), location: req.body };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            Location.update(updateParams, (err, location) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true, location: location });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .delete('/:id', (req, res, next) => {
        let Location = new LocationModel( globals );
        let routeHeader = "DELETE /location/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            Location.delete( parseInt(req.params.id), (err, deleteRes) => {
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
