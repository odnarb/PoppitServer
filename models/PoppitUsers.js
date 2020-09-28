/*
    DBAL for PoppitUsers
*/

const VALID_COLS = ["first_name","last_name","email_address","password_hash"];

class User {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){
        let sqlStr = "select `first_name`,`last_name`,`email_address`,`password_hash`,`active`,`created_at`,`updated_at` from poppit_users";

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
                this.globals.logger.debug( "Companies.find() result?: ", result[0]);
                cb(null,result[0]);
            }
        });
    }

    findOne(opts,cb){
        if( !opts.email && !opts.id ){
            cb({ error_type: "system", error: "email or id must be passed in" });
        } else {
            //use email
            let whereClause = "";
            if( opts.email && opts.email !== "" ){
                whereClause = "email_address=" + this.dbescape(opts.email) + " limit 1;";
            } else if ( opts.id && opts.id > 0 ) {
                whereClause = "id=" + this.dbescape(opts.id) + " limit 1;";
            } else {
                return cb({ error_type: "system", error: "email or id must be passed in" });
            }
            this.globals.logger.debug( "-- GET USER? ", whereClause );

            let sqlStr = "select `name`,`description`,`first_name`,`last_name`,`email_address`,`password_hash`,`address`,`city`,`state`,`zip`,`created_at`,`updated_at` from poppit_companies where " + whereClause;

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("Company.find() result?: ", result[0]);
                    cb(null,result[0]);
                }
            });
        }
    }

    create(vals, cb){
        if( valCols.filter(el => VALID_COLS.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            let sqlStr = "insert into poppit_users SET " + this.dbescape(vals)+ ";";

            this.execSQL(sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("PoppitUsers.create() result?: ", result);
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
            let sqlStr = "update poppit_users SET " + this.dbescape(vals)+ ";";

            this.execSQL(sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("PoppitUsers.update() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        let sqlStr = 'delete from poppit_users where id=' + id;
        this.execSQL(sqlStr, (error, result) => {
            if (error) {
                cb({ error_type: "system", error: error });
            } else {
                this.globals.logger.debug("PoppitUsers.delete() result?: ", result);
                cb(null, result);
            }
        });
    }
};

module.exports = User;
