/*
    DBAL for PoppitCampaigns
*/

const VALID_COLS = ["company_id","name","description","data","date_start","date_end","active"];

class Campaign {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){
        let sqlStr = "select `company_id`,`name`,`description`,`data`,`date_start`,`date_end`,`active`,`updated_at`,`created_at` from poppit_company_campaigns";

        if( opts && opts.limit && opts.limit <= 100 && opts.limit > 0 ){
            sqlStr += " limit " + this.dbescape(opts.limit);
        } else {
            sqlStr += " limit 10";
        }

        if( opts && opts.offset && opts.offset > 0 && opts.offset < 10000000000 ){
            sqlStr += " offset " + this.dbescape(opts.offset) + ";";
        } else {
            sqlStr += " offset 0;";
        }

        this.execSQL(this.db, sqlStr, (error, result) => {
            if (error) {
                cb({ error_type: "system", error: error });
            } else {
                this.globals.logger.debug("PoppitCampaigns.find() result?: ", result[0]);
                cb(null,result[0]);
            }
        });
    }

    findOne(opts,cb){
        if( !opts.id ){
            cb({ error_type: "system", error: "id must be passed in" });
        } else {
            let sqlStr = "select `company_id`,`name`,`description`,`data`,`date_start`,`date_end`,`active`,`updated_at`,`created_at` from poppit_company_campaigns where id=" + this.dbescape(opts.id) + " limit 1;";
            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("PoppitCampaigns.findOne() result?: ", result[0]);
                    cb(null,result[0]);
                }
            });
        }
    }

    create(vals, cb){
        if( valCols.filter(el => VALID_COLS.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            let sqlStr = "insert into poppit_company_campaigns SET " +this.dbescape(vals)+ ";";
            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("PoppitCampaigns.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    update(vals, cb){
        //only update what's been given to us
        let valCols = Object.keys(vals);

        if( valCols.filter(el => VALID_COLS.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            vals.updated_at = "NOW()";
            let sqlStr = "update poppit_company_campaigns SET " +this.dbescape(vals)+ ";";

            this.execSQL(sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("PoppitCampaigns.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        let sqlStr = 'delete from poppit_company_campaigns where id=' + id;
        execSQL(sqlStr, (error, result) => {
            if (error) {
                cb({ error_type: "system", error: error });
            } else {
                cb(null, result);
            }
        });
    }
}

module.exports = Campaign;
