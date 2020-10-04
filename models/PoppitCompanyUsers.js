/*
    DBAL for PoppitCompanyUsers
*/

const VALID_COLS = ["company_id","first_name","last_name","email_address","password_hash","forgot_password_token","active","company_permissions"];
const VALID_FILTER_COLS = ["first_name","last_name","email_address","active","registration_type","city","state"];

const IDENTITY_COL = "id";
const CREATED_AT_COL = "created_at";
const UPDATED_AT_COL = "updated_at";

class User {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){

        this.globals.logger.debug(`CompanyUser.find() :: BEFORE opts initialized: `, opts);

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

        this.globals.logger.debug(`CompanyUser.find() :: AFTER opts initialized: `, opts);

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

        this.globals.logger.debug(`CompanyUser.find() :: AFTER opts validation: `, opts);

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        if( Object.keys(opts.where).length > 0 ) {
            Object.keys(opts.where).filter(el => {
                if( VALID_FILTER_COLS.indexOf(el) < 0 ){
                    colErrors.push({ "invalid_col": el });
                }
            });
        }

        this.globals.logger.debug(`CompanyUser.find() :: colErrors: `, colErrors);

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
            let sqlStr = `SELECT ${cols} FROM poppit_company_users`;

            let totalCount = `SELECT count(*) as totalCount FROM poppit_company_users;`;
            let totalCountWithFilter = `SELECT count(*) as totalCountWithFilter FROM poppit_company_users;`;

            if( whereStr !== "" ) {
                sqlStr += ` WHERE ${whereStr}`;
                totalCountWithFilter = `SELECT count(*) as totalCountWithFilter FROM poppit_company_users WHERE ${whereStr};`;
            }

            sqlStr += ` ORDER BY ${opts.order.by} ${opts.order.direction}`;
            sqlStr += ` LIMIT ${opts.limit}`;
            sqlStr += ` OFFSET ${opts.offset};`;

            //add  these to the call
            sqlStr += `${totalCount}${totalCountWithFilter}`;

            this.globals.logger.debug( `CompanyUser.find() sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("CompanyUser.find() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug( "CompanyUser.find() result?: ", result);
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
            let sqlStr = `SELECT ${cols} FROM poppit_company_users where id=${this.dbescape(opts.id)};`;

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("CompanyUser.find() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("CompanyUser.find() result?: ", result[0]);
                    cb(null,result[0]);
                }
            });
        }
    }

    create(user, cb){
        //TODO: POP-168.. this poisons the company_permissions field
        user.company_permissions = {};

        //need more resilience: send back which columns are invalid?
        let colErrors = [];

        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        //START remove sensitive data
        //TODO: POP-168
        let search_index = local_valid_cols.indexOf("password_hash");
        if (search_index > -1) {
            local_valid_cols.splice(search_index, 1);
        }

        search_index = local_valid_cols.indexOf("forgot_password_token");
        if (search_index > -1) {
            local_valid_cols.splice(search_index, 1);
        }
        search_index = local_valid_cols.indexOf("company_permissions");
        if (search_index > -1) {
            local_valid_cols.splice(search_index, 1);
        }

        //TODO: POP-168
        delete user.company_permissions;

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

            let sqlStr = `INSERT INTO poppit_company_users (${colsStr}) `;
            sqlStr += `VALUES (${valsStr});`;

            this.globals.logger.debug("CompanyUser.create() sqlStr: ", sqlStr);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("CompanyUser.create() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("CompanyUser.create() result?: ", result.insertId);
                    cb(null,result.insertId);
                }
            });
        }
    }

    update(vals, cb){
        let user = vals.user;

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        Object.keys(user).filter(el => {
            if( VALID_COLS.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            user.updated_at = new Date();

            //TODO, POP-168: save a legit object for company_permissions
                //or, make it more generic
            user.company_permissions = { type: "JSON" };

            //json to  col -> val
            let updateStr = "";
            Object.keys( user ).map( (col) => {
                //TODO, POP-168: this poisons the query so JSON columns don't get written to
                if( user[col].type !== "JSON" ) {
                    updateStr += `${col}=${this.dbescape(user[col])},`;
                }
            });
            //remove the last comma
            updateStr = updateStr.slice(0,-1);

            let sqlStr = `UPDATE poppit_company_users SET ${updateStr} `;
            sqlStr += `where id = ${this.dbescape(vals.id)};`;

            this.globals.logger.debug("CompanyUser.update() sqlStr: ", sqlStr);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error("CompanyUser.update() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug("CompanyUser.update() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        let sqlStr = 'DELETE FROM poppit_company_users WHERE id=' + this.dbescape(id);

        this.globals.logger.debug("CompanyUser.delete() sqlStr: ", sqlStr);

        this.execSQL(this.db, sqlStr, (error, result) => {
            if (error) {
                this.globals.logger.error("CompanyUser.delete() :: ERROR : ", error);
                cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            } else {
                this.globals.logger.debug("CompanyUser.delete() result?: ", result);
                cb(null, result);
            }
        });
    }
}

module.exports = User;
