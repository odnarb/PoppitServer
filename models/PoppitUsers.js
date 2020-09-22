/*
    DBAL for PoppitUsers
*/
module.exports = {
    find: function(opts,cb){
        let sqlStr = "select `first_name`,`last_name`,`email_address`,`password_hash`,`active`,`created_at`,`updated_at` from poppit_users where email_address=" + mysql.escape(opts.email) + " limit 1;";

        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                console.log(getTime() + " - Users.find() result?: ", result[0]);
                cb(null,result[0]);
            }
        });
    },
    create: function(vals, cb){
        let cols = ["first_name","last_name","email_address","password_hash","updated_at","created_at"];

        vals.updated_at = "NOW()";
        vals.created_at = "NOW()";

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            let sqlStr = "insert into poppit_users SET " +mysql.escape(vals)+ ";";

            execSQL(sqlStr, function(error, result){
                if (error) {
                    cb(error);
                } else {
                    console.log(getTime() + " - Users.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    },
    update: function(vals, cb){

        let cols = ["first_name","last_name","email_address","password_hash","updated_at","created_at"];

        //only update what's been given to us
        let valCols = Object.keys(vals);

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            let sqlStr = "update poppit_users SET " +mysql.escape(vals)+ ";";

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
        let sqlStr = 'delete from poppit_users where id=' + id;
        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                cb(null, result);
            }
        });
    }
};