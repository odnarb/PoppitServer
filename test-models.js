/*
    DBAL for PoppitCompanies
*/

const VALID_COLS = ["name","description","address","city","state","zip"];
const VALID_FILTER_COLS = ["name","address","city","state","zip"];

const IDENTITY_COL = "id";
const CREATED_AT_COL = "created_at";
const UPDATED_AT_COL = "updated_at";


const execSQL = (db, sqlStr, cb) => {
    logger("execSQL :: db : ", db);
    logger("execSQL :: SQL STRING: ", sqlStr);

    // db.query(sqlStr, (error, result, fields) => {
    //     if (error) {
    //         cb(error);
    //     } else {
    //         cb(null,result);
    //     }
    // });
};

const logger = (msg, splat) => {
    if( splat !== undefined ) {
        console.log(msg, splat);
    } else {
        console.log(msg);
    }
};

class Model {
    constructor(opts) {

        this.model = opts;
        // if( opts == undefined ) {
        //     console.error("DB: No opts found ")
        // }

        // if( opts.db == undefined ) {
        //     console.error("DB: No db found ")
        // } else {
        //     this.db = opts.db;
        // }
        // if(opts.dbescape !== undefined) {
        //     console.error("DB: No escape found ")
        // } else {
        //     this.dbescape = opts.dbescape;
        // }
    }


    find(opts, cb){
        logger("in model: opts: ", opts);
        cb({ success: true });
    }

/*
    find(opts, cb){
        logger(`${this.table}.find() :: BEFORE opts initialized: `, opts);

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

        logger(`${this.table}.find() :: AFTER opts initialized: `, opts);

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

        logger(`${this.table}.find() :: AFTER opts validation: `, opts);

        //need more resilience: send back which columns are invalid?
        let colErrors = [];
        if( Object.keys(opts.where).length > 0 ) {
            Object.keys(opts.where).filter(el => {
                if( VALID_FILTER_COLS.indexOf(el) < 0 ){
                    colErrors.push({ "invalid_col": el });
                }
            });
        }

        logger(`${this.table}.find() :: colErrors: `, colErrors);

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
            let sqlStr = `SELECT ${cols} FROM ${this.table}`;

            let totalCount = `SELECT count(*) as totalCount FROM ${this.table};`;
            let totalCountWithFilter = `SELECT count(*) as totalCountWithFilter FROM ${this.table};`;

            if( whereStr !== "" ) {
                sqlStr += ` WHERE ${whereStr}`;
                totalCountWithFilter = `SELECT count(*) as totalCountWithFilter FROM ${this.table} WHERE ${whereStr};`;
            }

            sqlStr += ` ORDER BY ${opts.order.by} ${opts.order.direction}`;
            sqlStr += ` LIMIT ${opts.limit}`;
            sqlStr += ` OFFSET ${opts.offset};`;

            //add  these to the call
            sqlStr += `${totalCount}${totalCountWithFilter}`;

            logger( `${this.table}.find() sqlStr: ${sqlStr}` );

            this.execSQL("nodb", sqlStr, (error, result) => {
                if (error) {
                    logger(`${this.table}.find() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    logger( `${this.table}.find() result?: `, result);
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

            let sqlStr = `SELECT ${cols} FROM poppit_companies where id=${this.dbescape(opts.id)};`;

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    logger("Company.find() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    logger("Company.find() result?: ", result[0]);
                    cb(null,result[0]);
                }
            });
        }
    }

    create(company, cb){
 


        //need more resilience: send back which columns are invalid?
        let colErrors = [];

        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        //START remove sensitive data
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

            let sqlStr = `INSERT INTO poppit_companies (${colsStr}) `;
            sqlStr += `VALUES (${valsStr});`;

            logger("Company.create() sqlStr: ", sqlStr);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    logger("Company.create() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    logger("Company.create() result?: ", result.insertId);
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

            logger("Company.update() sqlStr: ", sqlStr);

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    logger("Company.update() :: ERROR : ", error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    logger("Company.update() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        let sqlStr = 'DELETE FROM poppit_companies WHERE id=' + this.dbescape(id);

        logger("Company.delete() sqlStr: ", sqlStr);

        this.execSQL(this.db, sqlStr, (error, result) => {
            if (error) {
                logger("Company.delete() :: ERROR : ", error);
                cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            } else {
                logger("Company.delete() result?: ", result);
                cb(null, result);
            }
        });
    }
*/
}

module.exports = Model;
