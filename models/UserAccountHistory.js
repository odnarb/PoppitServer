/*
    DBAL for UserAccountHistory
*/

const TABLE_NAME = "user_account_history";
const MODEL_NAME = "UserAccountHistory";
const OBJECT_NAME = "user_account_history";


const VALID_COLS = [
    "user_id",
    "product_id",
    "active",
    "payment_option",
    "payment_method",
    "card_name",
    "card_address1",
    "card_address2",
    "card_zip",
    "card_type",
    "cc_nbr",
    "cc_cvv",
    "exp_date",
    "data",
    "update_user_id",
    "create_user_id"
];

const IDENTITY_COL = "id";
const CREATED_AT_COL = "created_at";
const UPDATED_AT_COL = "updated_at";

class UserAccountHistory {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    findOne(opts,cb){
        if( opts.user_id === undefined ||  opts.user_id <= 0 ){
            cb({ error_type: "user", error: "user_id must be passed in" });
        } else {
            this.globals.logger.debug( `${MODEL_NAME}.findOne() :: user_id: ${opts.user_id}` );

            let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
            if( opts.cols ){
                cols = `${opts.cols.join(',')}`;
            }
            let sqlStr = `SELECT ${cols} FROM \`${TABLE_NAME}\` WHERE active=1 AND user_id=${this.dbescape(opts.user_id)} LIMIT 1;`;

            this.globals.logger.debug( `${MODEL_NAME}.findOne() :: sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                // this.globals.logger.debug( `${MODEL_NAME}.findOne() :: res: `, result );

                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.findOne() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else if ( result.length === 0 ) {
                    //not found
                    cb(null, { id: 0 });
                } else {
                    // this.globals.logger.debug(`${MODEL_NAME}.findOne() result?: `, result);
                    cb(null,result);
                }
            });
        }
    }
    create(obj, cb){
        //need more resilience: send back which columns are invalid?
        let colErrors = [];

        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        Object.keys(obj).filter(el => {
            if( local_valid_cols.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            //stringify data column, if any
            if( obj.data !== undefined ){
                let tmp = JSON.stringify(obj.data)
                obj.data = tmp
            }

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

            let sqlStr = `INSERT INTO \`${TABLE_NAME}\` (${colsStr}) `;
            sqlStr += `VALUES (${valsStr});`;

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.create() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else if( result === undefined || result.insertId === undefined || result.insertId <= 0 ){
                    this.globals.logger.error(`${MODEL_NAME}.create() :: ERROR : DB inserted id is empty/wrong?: `, result);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    cb(null, result.insertId)
                }
            });
        }
    }

    update(vals, cb){
        let obj = vals[OBJECT_NAME];

        // this.globals.logger.debug(`${MODEL_NAME}.update() :: vals: `, vals);
        // this.globals.logger.debug(`${MODEL_NAME}.update() :: VALID_COLS: `, VALID_COLS );
        // this.globals.logger.debug(`${MODEL_NAME}.update() :: Object.keys(obj): `, Object.keys(obj) );

        //need more resilience: send back which columns are invalid?
        let colErrors = [];

        delete vals.updated_at

        Object.keys(obj).filter(el => {
            if( VALID_COLS.indexOf(el) < 0 ){
                colErrors.push({ "invalid_col": el });
            }
        });

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            //stringify data column, if any
            if( obj.data !== undefined ){
                let tmp = JSON.stringify(obj.data)
                obj.data = tmp
            }

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
                    // this.globals.logger.debug(`${MODEL_NAME}.update() result?: `, result);
                    cb(null,result);
                }
            });
        }
    }

    createOrUpdate(obj, cb) {
        if( obj.user_id === undefined ||  obj.user_id <= 0 ){
            return cb({ error_type: "user", error: "user_id must be passed in" });
        }

        let account_id = 0;

        // this.globals.logger.debug(`${MODEL_NAME}.createOrUpdate() :: START :: obj: `, obj);

        this.findOne({ user_id: obj.user_id }, (err, res) => {
            if (err) {
                this.globals.logger.error(`${MODEL_NAME}.createOrUpdate() :: ERROR : `, err);
                return cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            }

            // this.globals.logger.debug(`${MODEL_NAME}.createOrUpdate() :: this.find() :: res, obj: `, res, obj);

            if (res.length > 0) {
                account_id = res[0].id

                let updateObj = {
                    id: res[0].id,
                    useraccount: obj
                }

                //remove these before sending to update
                delete updateObj.useraccount.updated_at
                delete updateObj.useraccount.created_at

                // this.globals.logger.debug(`${MODEL_NAME}.createOrUpdate() :: this.find() :: FOUND, just update with: `, updateObj);

                this.update(updateObj, (err, updated) => {
                    if (err) {
                        this.globals.logger.error(`${MODEL_NAME}.createOrUpdate() :: ERROR : `, err);
                        return cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                    }

                    // this.globals.logger.debug(`${MODEL_NAME}.createOrUpdate() :: this.find() :: updated record: `, updated);
                    return cb(null, account_id)
                })
            } else {
                //remove these before sending to create
                delete obj.updated_at
                delete obj.created_at

                // this.globals.logger.debug(`${MODEL_NAME}.createOrUpdate() :: this.find() :: Not found, creating new obj: `, obj);

                this.create(obj, (err, created_id) => {
                    if (err) {
                        this.globals.logger.error(`${MODEL_NAME}.createOrUpdate() :: ERROR : `, err);
                        return cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                    }

                    // this.globals.logger.debug(`${MODEL_NAME}.createOrUpdate() :: this.create() :: Create result: `, created_id);
                    return cb(null, created_id)
                })
            }
        })
    }
}

module.exports = UserAccountHistory;
