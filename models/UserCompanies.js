/*
    DBAL for UserCompanies
*/

const TABLE_NAME = "user_companies";
const MODEL_NAME = "UserCompanies";
const OBJECT_NAME = "company";

const VALID_COLS = [
    "id",
    "user_id",
    "name",
    "description",
    "address1",
    "address2",
    "city",
    "state_province",
    "country",
    "country_code",
    "postal_code",
    "website",
    "active",
    "data",
    "update_user_id",
    "updated_at",
    "create_user_id",
    "created_at"
];

class UserCompanies {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts,cb){

        this.globals.logger.debug(`${MODEL_NAME}.find() :: BEFORE opts initialized: `, opts);

        if (opts == undefined || !opts || Object.keys(opts).length === 0 ) {
            opts = {}
        }
        if( opts.order === undefined ) {
            opts.order = {
                by: "created_at",
                direction: "DESC"
            }
        }
        if( opts.limit === undefined ) {
            opts.limit = 10
        }
        if( opts.offset === undefined ) {
            opts.offset = 0
        }
        if( opts.where === undefined ) {
            opts.where = {}
        }

        this.globals.logger.debug(`${MODEL_NAME}.find() :: AFTER opts initialized: `, opts);

        //need to initialize filter out opts.order.by
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

        //lastly, make sure it's active
        opts.where.active = 1

        this.globals.logger.debug(`${MODEL_NAME}.find() :: AFTER opts validation: `, opts);

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        if( Object.keys(opts.where).length > 0 ) {
            Object.keys(opts.where).filter(el => {
                if( VALID_COLS.indexOf(el) < 0 ){
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
                if( Number.isInteger(opts.where[col]) ){
                    whereStr += `${col} = ${this.dbescape( opts.where[col] )}`;
                } else {
                    whereStr += `LOWER(${col}) LIKE CONCAT( LOWER(${this.dbescape( opts.where[col] )}), '%')`;
                }
            });

            let cols = `${VALID_COLS.join(',')}`;
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
        if( !opts.id ){
            cb({ error_type: "user", error: "id must be passed in" });
        } else {

            let cols = `${VALID_COLS.join(',')}`;
            let sqlStr = `SELECT ${cols} FROM ${TABLE_NAME} where id=${this.dbescape(opts.id)};`;

            this.globals.logger.debug( `${MODEL_NAME}.findOne() sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.find() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug(`${MODEL_NAME}.find() result?: `, result[0]);
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
        //END remove sensitive data

        Object.keys(obj).filter(el => {
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
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.create() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug(`${MODEL_NAME}.create() result?: `, result.insertId);
                    cb(null,result.insertId);
                }
            });
        }
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

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            obj.updated_at = new Date();

            //json to  col -> val
            let updateStr = "";
            Object.keys( obj ).map( (col) => {
                updateStr += `${col}=${this.dbescape(obj[col])},`;
            });
            //remove the last comma
            updateStr = updateStr.slice(0,-1);

            let sqlStr = `UPDATE ${TABLE_NAME} SET ${updateStr} `;
            sqlStr += `where id = ${this.dbescape(vals.id)};`;

            this.globals.logger.debug(`${MODEL_NAME}.update() sqlStr: ${sqlStr}`);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.update() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug(`${MODEL_NAME}.update() result?: `, result);
                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        // let sqlStr = `DELETE FROM ${TABLE_NAME} WHERE id=${this.dbescape(id)}`;
        let sqlStr = `UPDATE ${TABLE_NAME} SET active = 0 WHERE id=${this.dbescape(id)}`;

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

module.exports = UserCompanies;