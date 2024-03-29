/*
    DBAL for UserNotifications
*/

const TABLE_NAME = "user_notifications";
const MODEL_NAME = "UserNotifications";
const OBJECT_NAME = "user_notification";

const VALID_COLS = [
    "id",
    "user_id",
    "notification_type_id",
    "notification_method_id",
    "to_email",
    "from_email",
    "subject",
    "body_html",
    "body_text",
    "status",
    "status_detail",
    "active",
    "data",
    "update_user_id",
    "updated_at",
    "create_user_id",
    "created_at"
];

class UserNotifications {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    find(opts, cb) {
        this.globals.logger.debug(`${MODEL_NAME}.find() :: BEFORE opts initialized: `, opts);

        if (opts == undefined || !opts || Object.keys(opts).length === 0 ) {
            opts = {
                order: {
                    by: "created_at",
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
                whereStr += `LOWER(${col}) LIKE CONCAT( LOWER(${this.dbescape( opts.where[col] )}), '%')`;
            });

            let cols = VALID_COLS.join(',');
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

            let cols = VALID_COLS.join(',');
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
        if ( obj instanceof Array && obj.length === 0 ) {
            return cb({ error_type: "user", "error": "Notifications array is empty" });
        }

        let colErrors = [];
        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        //json to  col -> val
        let colsStr = "", valsStr = "", sqlStr = "", colsStrExample = ""

        //START COLUMN GENERATION

        //detect bad cols from a sample, either the object or an item from the array
        let sample = obj
        if ( obj instanceof Array && obj.length > 0 ) {
            sample = obj[0]
        }

        Object.keys(sample).filter(el => {
            if( local_valid_cols.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el })
            }
        })
        if( colErrors.length > 0 ){
            return cb({ error_type: "user", "error": colErrors });
        }

        //move on to create the col string
        Object.keys(sample).map( (col) => {
            colsStr += `\`${this.dbescape(col)}\`,`;
            colsStrExample += `\`${this.dbescape(col)}\`,`;
        });

        //remove the last comma
        colsStr = colsStr.slice(0,-1);

        //remove quotes around columns
        colsStr = colsStr.replace(/\'/g, "");

        //END COLUMN GENERATION

        if ( obj instanceof Array && obj.length > 0 ) {
            obj.forEach( (n,i) => {
                //first check the cols match
                let colsStr = ""
                Object.keys(sample).map( (col) => {
                    colsStr += `\`${this.dbescape(col)}\`,`;
                });
                if( colsStr !== colsStrExample ){
                    return cb({ error_type: "user", "error": `Columns at [${i}] differ from the first column set in the array.` });
                }

                valsStr += "("

                //get the vals
                Object.keys(n).map( (col) => {
                    valsStr += `${this.dbescape(n[col])},`;
                });

                //remove the last comma per item
                valsStr = valsStr.slice(0,-1);

                valsStr += "),"
            })

            //remove the last comma
            valsStr = valsStr.slice(0,-1);
        } else {
            valsStr += "("

            Object.keys( obj ).map( (col) => {
                valsStr += `${this.dbescape(obj[col])},`;
            });

            //remove the last comma
            valsStr = valsStr.slice(0,-1);

            valsStr += ")"
        }

        sqlStr = `INSERT INTO ${TABLE_NAME} (${colsStr}) `;
        sqlStr += `VALUES ${valsStr};`;

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

module.exports = UserNotifications;