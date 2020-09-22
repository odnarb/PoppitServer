/*
    DBAL for PoppitCompanyCampaigns
*/
module.exports = {
    find: function(opts,cb){
        let sqlStr = "select `company_id`,`name`,`description`,`data`,`date_start`,`date_end`,`active`,`updated_at`,`created_at` from poppit_company_campaigns where id=" + mysql.escape(opts.id) + " limit 1;";

        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                console.log(getTime() + " - CompanyCampaigns.find() result?: ", result[0]);
                cb(null,result[0]);
            }
        });
    },
    create: function(vals, cb){
        let cols = ["company_id","name","description","data","date_start","date_end","active","updated_at","created_at"];
 
        vals.updated_at = "NOW()";
        vals.created_at = "NOW()";

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            let sqlStr = "insert into poppit_company_campaigns SET " +mysql.escape(vals)+ ";";

            execSQL(sqlStr, function(error, result){
                if (error) {
                    cb(error);
                } else {
                    console.log(getTime() + " - CompanyCampaigns.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    },
    update: function(vals, cb){

        //we need to filter the cols we're really using
        let cols = ["company_id","name","description","data","date_start","date_end","active","updated_at","created_at"];

        //only update what's been given to us
        let valCols = Object.keys(vals);

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            vals.updated_at = "NOW()";
            let sqlStr = "update poppit_company_campaigns SET " +mysql.escape(vals)+ ";";

            execSQL(sqlStr, function(error, result){
                if (error) {
                    cb(error);
                } else {
                    console.log(getTime() + " - CompanyCampaigns.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    },
    delete:  function(id, cb){
        let sqlStr = 'delete from poppit_company_campaigns where id=' + id;
        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                cb(null, result);
            }
        });
    }
};