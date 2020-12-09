/*
    DBAL for Locations
*/

const TABLE_NAME = "company_locations";
const MODEL_NAME = "Location";
const OBJECT_NAME = "location";

const VALID_COLS = ["company_id","name","description","address","city","state","zip","country_code","latitude","longitude","altitude","polygon","active"];
const VALID_FILTER_COLS = ["company_id","name","address","city","state","zip","country_code","active"];

const IDENTITY_COL = "id";
const CREATED_AT_COL = "created_at";
const UPDATED_AT_COL = "updated_at";

class Location {
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

            let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
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

            let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
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

        this.globals.logger.debug(`${MODEL_NAME}.create() polygon JSON parsed: ${obj.polygon}`);

        // //TODO: POP-168.. this poisons the polygon field
        // obj.polygon = {};

        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        //START remove sensitive data
        //TODO: POP-168x
        // let search_index = local_valid_cols.indexOf("polygon");
        // if (search_index > -1) {
        //     local_valid_cols.splice(search_index, 1);
        // }

        // //TODO: POP-168
        if( obj.polygon ){
            try {
                let tmp = obj.polygon;

                //if the parse is successful, we can move on to save the stringified content.
                JSON.parse(tmp);

                obj.polygon = tmp;

                this.globals.logger.debug(`${MODEL_NAME}.create() polygon JSON parsed: `, obj.polygon);

            } catch(e) {
                this.globals.logger.debug(`${MODEL_NAME}.create() polygon JSON malformed: `, obj);
                delete obj.polygon;
            }
        } else {
            obj.polygon = '{}';
        }
        //END remove sensitive data

        //default altitude
        obj.altitude = 1;

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
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
                    this.globals.logger.debug(`Location.create() result?: ${result.insertId}`);
                    cb(null,result.insertId);
                }
            });
        }
    }

    update(vals, cb){
        let obj = vals[OBJECT_NAME];

        this.globals.logger.debug(`${MODEL_NAME}.update() polygon JSON raw: ${obj.polygon}`);

        // //TODO: POP-168.. this poisons the polygon field
        // obj.polygon = {};

        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        //START remove sensitive data
        //TODO: POP-168x
        // let search_index = local_valid_cols.indexOf("polygon");
        // if (search_index > -1) {
        //     local_valid_cols.splice(search_index, 1);
        // }

        // //TODO: POP-168
        if( obj.polygon ){
            try {
                let tmp = obj.polygon;

                //if the parse is successful, we can move on to save the stringified content.
                JSON.parse(tmp);

                obj.polygon = tmp;

                this.globals.logger.debug(`${MODEL_NAME}.update() polygon JSON parsed: `, obj.polygon);

            } catch(e) {
                this.globals.logger.debug(`${MODEL_NAME}.update() polygon JSON malformed: `, obj);
                delete obj.polygon;
            }
        } else {
            obj.polygon = '{}';
        }
        //END remove sensitive data

        //default altitude
        obj.altitude = 1;

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

            //default altitude
            obj.altitude = 1;

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

module.exports = Location;
