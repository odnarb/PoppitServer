/*
    DBAL for PoppitCompanies
*/

class Company {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){
        let sqlStr = "select `name`,`description`,`first_name`,`last_name`,`email_address`,`password_hash`,`address`,`city`,`state`,`zip`,`created_at`,`updated_at` from poppit_companies";

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
    };

    findOne(opts,cb){
        if( !opts.id ){
            cb({ error_type: "system", error: "id must be passed in" });
        } else {
            let sqlStr = "select `name`,`description`,`first_name`,`last_name`,`email_address`,`password_hash`,`address`,`city`,`state`,`zip`,`created_at`,`updated_at` from poppit_companies where id=" + this.dbescape(opts.id) + ";";

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("Company.find() result?: ", result[0]);
                    cb(null,result[0]);
                }
            });
        }
    };

    create(vals, cb){
        let cols = ["name","description","first_name","last_name","email_address","password_hash","address","city","state","zip","updated_at","created_at"];

        vals.updated_at = "NOW()";
        vals.created_at = "NOW()";

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ error_type: "system", "error": "invalid_cols" });
        } else {
            let sqlStr = "insert into poppit_companies SET " + this.dbescape(vals)+ ";";

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("Company.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    update(vals, cb){

        //we need to filter the cols we're really using
        let cols = ["name","description","first_name","last_name","email_address","password_hash","address","city","state","zip"];

        //only update what's been given to us
        let valCols = Object.keys(vals);

        //need more resilience: send back which columns are invalid?

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ error_type: "system", "error": "invalid_cols" });
        } else {
            vals.updated_at = "NOW()";
            let sqlStr = "update poppit_companies SET " + this.dbescape(vals)+ ";";

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    cb({ error_type: "system", error: error });
                } else {
                    this.globals.logger.debug("Company.update() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        let sqlStr = 'delete from poppit_companies where id=' + this.dbescape(id);
        this.execSQL(this.db, sqlStr, (error, result) => {
            if (error) {
                cb({ error_type: "system", error: error });
            } else {
                this.globals.logger.debug("Company.delete() result?: ", result);
                cb(null, result);
            }
        });
    }
}

module.exports = Company;
