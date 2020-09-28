/*
    DBAL for PoppitCompanies
*/

const VALID_COLS = ["name","description","address","city","state","zip"];

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
                this.globals.logger.error("Company.find() :: ERROR : ", error);
                cb({ error_type: "system", error: "A system error has occurred, please contact support" });
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
                    this.globals.logger.error("Company.find() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("Company.find() result?: ", result[0]);
                    cb(null,result[0]);
                }
            });
        }
    };

    create(vals, cb){
        if( valCols.filter(el => VALID_COLS.indexOf(el) < 0).length > 0 ){
            cb({ error_type: "system", "error": "invalid_cols" });
        } else {
            let sqlStr = "insert into poppit_companies SET " + this.dbescape(vals)+ ";";

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("Company.create() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("Company.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    update(vals, cb){
        let company = vals.company;

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        Object.keys(company).filter(el => {
            if( VALID_COLS.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if( colErrors.length > 0 ){
            cb({ error_type: "system", "error": colErrors });
        } else {
            company.updated_at = new Date();

            //json to  col -> val
            let updateStr = "";
            Object.keys( company ).map( (col) => {
                updateStr += `${col}=${this.dbescape(company[col])},`;
            });
            //remove the last comma
            updateStr = updateStr.slice(0,-1);

            let sqlStr = `update poppit_companies SET ${updateStr} `;
            sqlStr += `where id = ${this.dbescape(vals.id)};`;

            this.globals.logger.debug("Company.update() sqlStr: ", sqlStr);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("Company.update() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
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
                this.globals.logger.error("Company.delete() :: ERROR : ", error);
                cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            } else {
                this.globals.logger.debug("Company.delete() result?: ", result);
                cb(null, result);
            }
        });
    }
}

module.exports = Company;
