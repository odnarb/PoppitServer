/*
    DBAL for PoppitCompanies
*/

const VALID_COLS = ["name","description","address","city","state","zip"];
const VALID_FILTER_COLS = ["name","address","city","state","zip"];

class Company {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){
        //allow filter on name, address, city, state, zip
        // let filters = ["name", "address", "city", "state", "zip"];

        if (opts == undefined || !opts) {
            opts = {};
        }
        if (opts.where == undefined) {
            opts.where = {};
        }
        if (opts.limit == undefined) {
            opts.limit = 10;
        }
        if (opts.offset == undefined) {
            opts.offset = 0;
        }

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        if( Object.keys(opts.where).length > 0 ) {
            Object.keys(opts.where).filter(el => {
                if( VALID_FILTER_COLS.indexOf(el) < 0 ){
                    colErrors.push({ "invalid_col": el });
                }
            });
        }

        if( colErrors.length > 0 ){
            cb({ error_type: "system", "error": colErrors });
        } else {
            //json to  col -> val
            let whereStr = "";
            Object.keys( opts.where ).map( (col) => {
                whereStr += `${col}=${this.dbescape(opts.where[col])},`;
            });
            //remove the last comma
            whereStr = whereStr.slice(0,-1);

            let sqlStr = "select name,description,address,city,state,zip,created_at,updated_at from poppit_companies";

            if( whereStr !== "" ) {
                sqlStr += ` where ${whereStr}`
            }

            let limit = parseInt(opts.limit);
            if( limit <= 100 && limit > 0 ){
                sqlStr += " limit " + this.dbescape(limit);
            } else {
                sqlStr += " limit 10";
            }

            let offset = parseInt(opts.offset);
            if( offset > 0 && offset < 10000000000 ){
                sqlStr += " offset " + this.dbescape(offset) + ";";
            } else {
                sqlStr += " offset 0;";
            }

            this.globals.logger.debug( "Companies.find() sqlStr: ", sqlStr);

            cb(null,true);

            // this.execSQL(this.db, sqlStr, (error, result) => {
            //     if (error) {
            //         this.globals.logger.error("Company.find() :: ERROR : ", error);
            //         cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            //     } else {
            //         this.globals.logger.debug( "Companies.find() result?: ", result[0]);
            //         cb(null,result[0]);
            //     }
            // });
        }
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

    create(company, cb){
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
            //json to  col -> val
            let colsStr = VALID_COLS.join(',');
            let valsStr = "";

            Object.keys( company ).map( (col) => {
                valsStr += `${this.dbescape(company[col])},`;
            });

            //remove the last comma
            valsStr = valsStr.slice(0,-1);

            let sqlStr = `INSERT INTO poppit_companies (${colsStr}) `;
            sqlStr += `VALUES (${valsStr});`;

            this.globals.logger.debug("Company.create() sqlStr: ", sqlStr);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("Company.create() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("Company.create() result?: ", result.insertId);
                    cb(null,result.insertId);
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

            let sqlStr = `UPDATE poppit_companies SET ${updateStr} `;
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
        let sqlStr = 'DELETE FROM poppit_companies WHERE id=' + this.dbescape(id);

        this.globals.logger.debug("Company.delete() sqlStr: ", sqlStr);

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
