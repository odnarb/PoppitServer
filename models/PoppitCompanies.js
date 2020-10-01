/*
    DBAL for PoppitCompanies
*/

const VALID_COLS = ["name","description","address","city","state","zip"];
const VALID_FILTER_COLS = ["name","address","city","state","zip"];
const CREATED_AT_COL = "created_at";

class Company {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){

        this.globals.logger.debug(`Companies.find() :: BEFORE opts initialized: `, opts);

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

        this.globals.logger.debug(`Companies.find() :: AFTER opts initialized: `, opts);

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

        this.globals.logger.debug(`Companies.find() :: AFTER opts validation: `, opts);

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        if( Object.keys(opts.where).length > 0 ) {
            Object.keys(opts.where).filter(el => {
                if( VALID_FILTER_COLS.indexOf(el) < 0 ){
                    colErrors.push({ "invalid_col": el });
                }
            });
        }

        this.globals.logger.debug(`Companies.find() :: colErrors: `, colErrors);

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

            let sqlStr = "SELECT name,description,address,city,state,zip,created_at,updated_at FROM poppit_companies";

            if( whereStr !== "" ) {
                sqlStr += ` WHERE ${whereStr}`;
            }

            sqlStr += ` ORDER BY ${opts.order.by} ${opts.order.direction}`;
            sqlStr += ` LIMIT ${opts.limit}`;
            sqlStr += ` OFFSET ${opts.offset};`;

            this.globals.logger.debug( `Companies.find() sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("Company.find() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug( "Companies.find() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    findOne(opts,cb){
        if( !opts.id ){
            cb({ error_type: "user", error: "id must be passed in" });
        } else {
            let sqlStr = "select name,description,address,city,state,zip,created_at,updated_at from poppit_companies where id=" + this.dbescape(opts.id) + ";";

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
    }

    create(company, cb){
        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        Object.keys(company).filter(el => {
            if( VALID_COLS.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
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
            cb({ error_type: "user", "error": colErrors });
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
