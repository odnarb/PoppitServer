/*
    DBAL for CompanyUsers
*/

const TABLE_NAME = "company_users";
const MODEL_NAME = "CompanyUser";
const OBJECT_NAME = "user";

const VALID_COLS_MASS = ["company_id","first_name","last_name","email_address","phone_number","active","admin","company_role","company_contact"];
const VALID_COLS = ["company_id","first_name","last_name","email_address","phone_number","password_hash","invite_token","forgot_password_token","active","admin","company_role","company_contact"];
const VALID_FILTER_COLS = ["first_name","last_name","email_address","phone_number","active","registration_type","city","state","company_contact"];

const IDENTITY_COL = "id";
const CREATED_AT_COL = "created_at";
const UPDATED_AT_COL = "updated_at";

let mapRoleLookup = (role_text) => {
    let res = -1
    if (role_text === "none") {
        res = 0;
    } else if (role_text === "admin") {
        res = 1;
    } else if (role_text === "technical") {
        res = 2;
    } else if (role_text === "marketing") {
        res = 3;
    }
    return res;
};

class CompanyUser {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){

        this.globals.logger.debug(`${MODEL_NAME}.find() :: BEFORE opts initialized: `, opts);

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

        this.globals.logger.debug(`${MODEL_NAME}.find() :: AFTER opts initialized: `, opts);

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

        this.globals.logger.debug(`${MODEL_NAME}.find() :: AFTER opts validation: `, opts);

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        if( Object.keys(opts.where).length > 0 ) {
            Object.keys(opts.where).filter(el => {
                if( VALID_FILTER_COLS.indexOf(el) < 0 ){
                    colErrors.push({ "invalid_col": el });
                }
            });
        }

        this.globals.logger.debug(`${MODEL_NAME}.find() :: colErrors: `, colErrors);

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

            let cols = `${IDENTITY_COL},${VALID_COLS_MASS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
            let sqlStr = `SELECT ${cols} FROM ${TABLE_NAME}`;

            let totalCount = `SELECT count(*) as totalCount FROM ${TABLE_NAME};`;
            let totalCountWithFilter = `SELECT count(*) as totalCountWithFilter FROM ${TABLE_NAME};`;

            if( whereStr !== "" ) {
                sqlStr += ` WHERE ${whereStr}`;
                totalCountWithFilter = `SELECT count(*) as totalCountWithFilter FROM ${TABLE_NAME} WHERE ${whereStr};`;
            }

            sqlStr += ` ORDER BY ${opts.order.by} ${opts.order.direction}`;
            sqlStr += ` LIMIT ${opts.limit}`;
            sqlStr += ` OFFSET ${opts.offset};`;

            //add  these to the call
            sqlStr += `${totalCount}${totalCountWithFilter}`;

            this.globals.logger.debug( `${MODEL_NAME}.find() sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.find() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug( `${MODEL_NAME}.find() result?: `, result);
                    cb(null,result);
                }
            });
        }
    }

    findOne(opts,cb){
        if( !opts.email_address ){
            cb({ error_type: "user", error: "email_address must be passed in" });
        } else {

            let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
            let sqlStr = `SELECT ${cols} FROM ${TABLE_NAME} where email_address=${this.dbescape(opts.email_address)};`;

            this.globals.logger.debug( `${MODEL_NAME}.findOne() sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.findOne() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug(`${MODEL_NAME}.findOne() result?: `, result[0]);
                    cb(null,result[0]);
                }
            });
        }
    }

    create(obj, cb){
        //need more resilience: send back which columns are invalid?
        let colErrors = [];

        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        //START remove sensitive data
        //TODO: POP-168
        let search_index = local_valid_cols.indexOf("forgot_password_token");
        if (search_index > -1) {
            local_valid_cols.splice(search_index, 1);
        }
        //END remove sensitive data

        //get the company role
        if( mapRoleLookup(obj.company_role) == -1 ){
            colErrors.push({ "invalid_value": "company_role" });
        }

        Object.keys(obj).filter(el => {
            if( local_valid_cols.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {

            let tmp_company_role = mapRoleLookup(obj.company_role);
            obj.company_role = tmp_company_role;

            //json to  col -> val
            let colsStr = "";
            let valsStr = "";

            Object.keys( obj ).map( (col) => {
                colsStr += `${this.dbescape(col)},`;
            });

            Object.keys( obj ).map( (col) => {
                valsStr += `${this.dbescape(obj[col])},`;
            });

            //remove the last comma
            valsStr = valsStr.slice(0,-1);
            colsStr = colsStr.slice(0,-1);

            //remove quotes around columns
            colsStr = colsStr.replace(/\'/g, "");

            let sqlStr = `INSERT INTO ${TABLE_NAME} (${colsStr}) `;
            sqlStr += `VALUES (${valsStr});`;

            this.globals.logger.debug(`${MODEL_NAME}.create() sqlStr: ${sqlStr}`);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error && error.toString().indexOf("ER_DUP_ENTRY") > -1 ) {
                    this.globals.logger.error(`${MODEL_NAME}.create() :: DUPLICATE ENTRY ERROR : `, error);
                    cb({ error_type: "user", error: "Email already exists" });
                } else if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.create() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug(`${MODEL_NAME}.create() result?: `, result.insertId);
                    cb(null,result.insertId);
                }
            });
        }
    }

    confirmRegistration(obj, cb){

        let updateStr = `UPDATE ${TABLE_NAME} SET invite_token='', active=1 `;
        updateStr += `where id = ${this.dbescape(obj.id)} AND invite_token = ${this.dbescape(obj.token)};`;

        let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
        let sqlStr = `SELECT ${cols} FROM ${TABLE_NAME} where id=${this.dbescape(obj.id)} LIMIT 1;`;

        updateStr = `${updateStr}${sqlStr}`;

        this.globals.logger.debug(`${MODEL_NAME}.confirmRegistration() updateStr: ${updateStr}`);

        this.execSQL(this.db, updateStr, (error, result) => {
            if (error) {
                this.globals.logger.error(`${MODEL_NAME}.confirmRegistration() :: ERROR : `, error);
                cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            } else {
                this.globals.logger.debug(`${MODEL_NAME}.confirmRegistration() result? BEFORE MODS: `, result);

                let user = result[1][0];

                delete user.password_hash;
                delete user.forgot_password_token;
                delete user.invite_token;

                result[1] = user;

                this.globals.logger.debug(`${MODEL_NAME}.confirmRegistration() result? BEFORE RETURN: `, result);

                cb(null,result);
            }
        });
    }

    update(vals, cb){
        let obj = vals[OBJECT_NAME];

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        Object.keys(obj).filter(el => {
            if( VALID_COLS.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if(obj.company_role) {
            //get the company role
            if( mapRoleLookup(obj.company_role) == -1 ){
                colErrors.push({ "invalid_value": "company_role" });
            }
        }

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            obj.updated_at = new Date();

            if(obj.company_role) {
                let tmp_company_role = mapRoleLookup(obj.company_role);
                obj.company_role = tmp_company_role;
            }

            //json to  col -> val
            let updateStr = "";
            Object.keys( obj ).map( (col) => {
                //TODO, POP-168: this poisons the query so JSON columns don't get written to
                if( obj[col].type !== "JSON" ) {
                    updateStr += `${col}=${this.dbescape(obj[col])},`;
                }
            });
            //remove the last comma
            updateStr = updateStr.slice(0,-1);

            let sqlStr = `UPDATE ${TABLE_NAME} SET ${updateStr} `;
            sqlStr += `where id = ${this.dbescape(vals.id)};`;

            let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
            let userSqlStr = `SELECT ${cols} FROM ${TABLE_NAME} where id=${this.dbescape(vals.id)} LIMIT 1;`;

            let finalSqlStr = `${sqlStr}${userSqlStr}`;

            this.globals.logger.debug(`${MODEL_NAME}.update() finalSqlStr: ${finalSqlStr}`);

            this.globals.logger.debug(`${MODEL_NAME}.update() finalSqlStr: ${finalSqlStr}`);

            this.execSQL(this.db, finalSqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.update() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {

                    let user = result[1];

                    delete user.password_hash;
                    delete user.forgot_password_token;
                    delete user.invite_token;

                    result[1] = user;

                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        let sqlStr = `DELETE FROM ${TABLE_NAME} WHERE id=${this.dbescape(id)}`;

        this.globals.logger.debug(`${MODEL_NAME}.delete() sqlStr: ${sqlStr}`);

        this.execSQL(this.db, sqlStr, (error, result) => {
            if (error) {
                this.globals.logger.error(`${MODEL_NAME}.delete() :: ERROR : `, error);
                cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            } else {
                this.globals.logger.debug(`${MODEL_NAME}.delete() result?: `, result);
                cb(null, result);
            }
        });
    }
}

module.exports = CompanyUser;