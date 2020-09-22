/*
    DBAL for PoppitCompanies
*/
module.exports = {
    find: function(opts,cb){
        let sqlStr = "select `name`,`description`,`first_name`,`last_name`,`email_address`,`password_hash`,`address`,`city`,`state`,`zip`,`created_at`,`updated_at` from poppit_companies where id=" + mysql.escape(opts.id) + " limit 1;";

        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                console.log(getTime() + " - Companies.find() result?: ", result[0]);
                cb(null,result[0]);
            }
        });
    },
    create: function(vals, cb){
        let cols = ["name","description","first_name","last_name","email_address","password_hash","address","city","state","zip","updated_at","created_at"];

        vals.updated_at = "NOW()";
        vals.created_at = "NOW()";

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            let sqlStr = "insert into poppit_companies SET " +mysql.escape(vals)+ ";";

            execSQL(sqlStr, function(error, result){
                if (error) {
                    cb(error);
                } else {
                    console.log(getTime() + " - Companies.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    },
    update: function(vals, cb){

        //we need to filter the cols we're really using
        let cols = ["name","description","first_name","last_name","email_address","password_hash","address","city","state","zip"];

        //only update what's been given to us
        let valCols = Object.keys(vals);

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            vals.updated_at = "NOW()";
            let sqlStr = "update poppit_companies SET " +mysql.escape(vals)+ ";";

            execSQL(sqlStr, function(error, result){
                if (error) {
                    cb(error);
                } else {
                    console.log(getTime() + " - Companies.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    },
    delete:  function(id, cb){
        let sqlStr = 'delete from poppit_companies where id=' + id;
        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                cb(null, result);
            }
        });
    }
};