/*
    DBAL for BadEmails
*/

const TABLE_NAME = "bad_emails";
const MODEL_NAME = "BadEmails";
const OBJECT_NAME = "bad_emails";

const VALID_COLS = [
    "id",
    "email_address",
    "reason",
    "reason_detail",
    "data",
    "active",
    "updated_at",
    "update_user_id",
    "created_at",
    "create_user_id"
];

class BadEmails {
    constructor(globals) {
        this.globals = globals;
        this.execSQL = globals.execSQL;
        this.db = globals.db;
        this.dbescape = globals.dbescape;
    }

    //this is meant for CRUD operations on the admin screens
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
                if (error && error.toString().indexOf("ER_DUP_ENTRY") > -1 ) {
                    this.globals.logger.error(`${MODEL_NAME}.create() :: DUPLICATE ENTRY ERROR : `, error);
                    cb({ error_type: "user", error: "Email already exists" });
                } else if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.create() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else if( result.insertId > 0 ){
                    cb(null, { email_address: obj.email_address })
                } else {
                    cb(null, false)
                }
            });
        }
    }
}

module.exports = BadEmails;
