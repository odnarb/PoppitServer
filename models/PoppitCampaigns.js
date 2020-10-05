/*
    DBAL for PoppitCampaigns
*/

const VALID_COLS = ["company_id","name","category","description","game_id","data","date_start","date_end","active"];
const VALID_FILTER_COLS = ["company_id","name","category","game_id","date_start","date_end","active"];

const IDENTITY_COL = "id";
const CREATED_AT_COL = "created_at";
const UPDATED_AT_COL = "updated_at";

class Campaign {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){

        this.globals.logger.debug(`Campaign.find() :: BEFORE opts initialized: `, opts);

        if (opts == undefined || !opts || Object.keys(opts).length === 0 ) {
            opts = {
                order: {
                    by: CREATED_AT_COL,
                    direction: "DESC"
                },
                limit: 10,
                offset: 0,
                where: {}
            };
        }

        this.globals.logger.debug(`Campaign.find() :: AFTER opts initialized: `, opts);

        //need to initialize filter out opts.order.by

        if( opts.order.direction == undefined ){
            opts.order.direction = "DESC";
        }
        if (opts.order.direction.toUpperCase() === "DESC") {
            opts.order.direction = "DESC";
        } else {
            opts.order.direction = "ASC";
        }

        if ( parseInt(opts.limit) > 100 ) {
            opts.limit = 100;
        } else if ( parseInt(opts.limit) < 0 ) {
            opts.limit = 0;
        } else {
            opts.limit = parseInt(opts.limit);
        }

        if( parseInt(opts.offset) > Number.MAX_SAFE_INTEGER ) {
            opts.offset = 100;
        } else if ( parseInt(opts.offset) < 0 ) {
            opts.offset = 0;
        } else {
            opts.offset = parseInt(opts.offset);
        }

        this.globals.logger.debug(`Campaign.find() :: AFTER opts validation: `, opts);

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        if( Object.keys(opts.where).length > 0 ) {
            Object.keys(opts.where).filter(el => {
                if( VALID_FILTER_COLS.indexOf(el) < 0 ){
                    colErrors.push({ "invalid_col": el });
                }
            });
        }

        this.globals.logger.debug(`Campaign.find() :: colErrors: `, colErrors);

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            //json to  col -> val
            let whereStr = "";
            let whereCount = 0;
            Object.keys( opts.where ).map( (col) => {
                whereCount++;
                if( whereCount > 1 ) whereStr += " AND ";
                whereStr += `LOWER(${col}) LIKE CONCAT( LOWER(${this.dbescape( opts.where[col] )}), '%')`;
            });

            let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
            let sqlStr = `SELECT ${cols} FROM poppit_campaigns`;

            let totalCount = `SELECT count(*) as totalCount FROM poppit_campaigns;`;
            let totalCountWithFilter = `SELECT count(*) as totalCountWithFilter FROM poppit_campaigns;`;

            if( whereStr !== "" ) {
                sqlStr += ` WHERE ${whereStr}`;
                totalCountWithFilter = `SELECT count(*) as totalCountWithFilter FROM poppit_campaigns WHERE ${whereStr};`;
            }

            sqlStr += ` ORDER BY ${opts.order.by} ${opts.order.direction}`;
            sqlStr += ` LIMIT ${opts.limit}`;
            sqlStr += ` OFFSET ${opts.offset};`;

            //add  these to the call
            sqlStr += `${totalCount}${totalCountWithFilter}`;

            this.globals.logger.debug( `Campaign.find() sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("Campaign.find() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug( "Campaign.find() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    findOne(opts,cb){
        if( !opts.id ){
            cb({ error_type: "user", error: "id must be passed in" });
        } else {

            let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;

            let sqlStr = `SELECT ${cols} FROM poppit_campaigns where id=${this.dbescape(opts.id)};`;

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("Campaign.find() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("Campaign.find() result?: ", result[0]);
                    cb(null,result[0]);
                }
            });
        }
    }

    create(campaign, cb){

        //need more resilience: send back which columns are invalid?
        let colErrors = [];

        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        //START remove sensitive data
        //END remove sensitive data

        Object.keys(user).filter(el => {
            if( local_valid_cols.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            //json to  col -> val
            let colsStr = "";
            let valsStr = "";

            Object.keys( user ).map( (col) => {
                colsStr += `${this.dbescape(col)},`;
            });

            Object.keys( user ).map( (col) => {
                valsStr += `${this.dbescape(user[col])},`;
            });

            //remove the last comma
            valsStr = valsStr.slice(0,-1);
            colsStr = colsStr.slice(0,-1);

            //remove quotes around columns
            colsStr = colsStr.replace(/\'/g, "");

            let sqlStr = `INSERT INTO poppit_campaigns (${colsStr}) `;
            sqlStr += `VALUES (${valsStr});`;

            this.globals.logger.debug("Campaign.create() sqlStr: ", sqlStr);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("Campaign.create() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("Campaign.create() result?: ", result.insertId);
                    cb(null,result.insertId);
                }
            });
        }
    }

    update(vals, cb){
        let campaign = vals.campaign;

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        Object.keys(campaign).filter(el => {
            if( VALID_COLS.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            campaign.updated_at = new Date();

            //json to  col -> val
            let updateStr = "";
            Object.keys( campaign ).map( (col) => {
                updateStr += `${col}=${this.dbescape(campaign[col])},`;
            });
            //remove the last comma
            updateStr = updateStr.slice(0,-1);

            let sqlStr = `UPDATE poppit_campaigns SET ${updateStr} `;
            sqlStr += `where id = ${this.dbescape(vals.id)};`;

            this.globals.logger.debug("Campaign.update() sqlStr: ", sqlStr);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("Campaign.update() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("Campaign.update() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        let sqlStr = 'DELETE FROM poppit_campaigns WHERE id=' + this.dbescape(id);

        this.globals.logger.debug("Campaign.delete() sqlStr: ", sqlStr);

        this.execSQL(this.db, sqlStr, (error, result) => {
            if (error) {
                this.globals.logger.error("Campaign.delete() :: ERROR : ", error);
                cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            } else {
                this.globals.logger.debug("Campaign.delete() result?: ", result);
                cb(null, result);
            }
        });
    }
}

module.exports = Campaign;
