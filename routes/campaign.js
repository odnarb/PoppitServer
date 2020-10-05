//campaign routes

let express = require('express');
let router = express.Router();

let CampaignModel = require('../models/PoppitCampaigns');

module.exports = (globals) => {
    return router
    // /campaign (get all campaigns)
    .get('/', (req, res, next) => {
        let Campaign = new CampaignModel( globals );
        let routeHeader = "GET /campaign (HTTP)";

        if( req.xhr == true ){
            routeHeader = "GET /campaign (XHR)";

            try {
                globals.logger.debug( `${routeHeader} :: BEGIN :: filtered campaign list` );

                globals.logger.debug( `${routeHeader} :: req.params: `, req.params );
                globals.logger.debug( `${routeHeader} :: req.query: `, req.query );
                globals.logger.debug( `${routeHeader} :: req.body: `, req.body );

                //later filter or sort on the # of locations
                //later filter or sort on the # of compaigns

                let params = req.query;

                //remove timestamp param for datatables
                if( params._ !== undefined ) delete params._;

                //get campaigns
                Campaign.find(req.query, (err, campaigns) => {
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
                        aaData: campaigns[0],
                        iTotalRecords: campaigns[1].totalCount,
                        iTotalDisplayRecords: campaigns[2].totalCountWithFilter
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
                return res.render('pages/campaign',{
                    pageTitle: `${process.env.APP_NAME} | Search Campaigns`
                });
            } catch( err ) {
                globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
                return next(err);
            }
        }
    })
    //create campaign
    .post('/', (req, res, next) => {
        let Campaign = new CampaignModel( globals );
        let routeHeader = "POST /campaign";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            let createParams = req.body;

            globals.logger.info(`${routeHeader} :: createParams: `, createParams );

            Campaign.create(createParams, (err, new_campaign_id) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( `${routeHeader} :: Campaign created: ${new_campaign_id}` );

                globals.logger.info( `${routeHeader} :: END` );
                return res.json({ success: true, campaign_id: new_campaign_id });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    // campaign/:id operations
    .get('/:id', (req, res, next) => {
        let Campaign = new CampaignModel( globals );
        let routeHeader = "GET /campaign/:id";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            //get campaign
            Campaign.findOne({ id: parseInt(req.params.id) }, (err, campaign) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info(`GET /campaign/:id :: campaign.id: ${req.params.id}`, campaign);

                globals.logger.info( `${routeHeader} :: END` );

                return res.json(campaign);
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .put('/:id', (req, res, next) => {
        let Campaign = new CampaignModel( globals );
        let routeHeader = "PUT /campaign/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id}` );

            let updateParams = { id: parseInt(req.params.id), campaign: req.body };

            globals.logger.info(routeHeader + ` :: id & updateParams: ${req.params.id} :: `, updateParams );

            Campaign.update(updateParams, (err, campaign) => {
                if(err){
                    res.status(500);
                    return next(err);
                }

                globals.logger.info( routeHeader  + " :: END" );
                return res.json({ success: true, campaign: campaign });
            });
        } catch( err ) {
            globals.logger.error(`${routeHeader} :: CAUGHT ERROR`);
            return next(err);
        }
    })
    .delete('/:id', (req, res, next) => {
        let Campaign = new CampaignModel( globals );
        let routeHeader = "DELETE /campaign/:id ";

        try {
            globals.logger.info( `${routeHeader} :: BEGIN` );

            globals.logger.info( `${routeHeader} :: id: ${req.params.id} :: ` );

            Campaign.delete( parseInt(req.params.id), (err, deleteRes) => {
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
