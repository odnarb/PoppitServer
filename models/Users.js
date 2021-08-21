/*
    DBAL for User
*/

const TABLE_NAME = "user";
const MODEL_NAME = "User";
const OBJECT_NAME = "user";

const VALID_COLS_MASS = [
    "user_type_id",
    "language_id",
    "active",
    "first_name",
    "last_name",
    "email_address",
    "phone",
    "profession",
    "address1",
    "address2",
    "city",
    "state_province",
    "country",
    "country_code",
    "postal_code",
    "profile_picture",
    "password_hash",
    "verified",
    "data",
    "update_user_id",
    "create_user_id"
];

const VALID_COLS = [
    "user_type_id",
    "language_id",
    "active",
    "first_name",
    "last_name",
    "gender",
    "needs_pw_change",
    "forgot_password_token",
    "email_address",
    "phone",
    "profession",
    "address1",
    "address2",
    "city",
    "state_province",
    "country",
    "country_code",
    "postal_code",
    "profile_picture",
    "password_hash",
    "verified",
    "invite_token",
    "data",
    "update_user_id",
    "create_user_id"
];
const VALID_FILTER_COLS = [
    "user_type_id",
    "language_id",
    "active",
    "first_name",
    "last_name",
    "email_address",
    "phone",
    "profession",
    "address1",
    "address2",
    "city",
    "state_province",
    "country",
    "country_code",
    "postal_code",
    "profile_picture",
    "verified",
    "update_user_id",
    "create_user_id"
];

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

        // this.globals.logger.debug(`${MODEL_NAME}.find() :: AFTER opts initialized: `, opts);

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
        if( !parseInt(opts.id) && !opts.email_address){
            cb({ error_type: "user", error: "An id or email_address must be passed in" });
        } else if( parseInt(opts.id) <= 0 && opts.email_address === ""){
            cb({ error_type: "user", error: "A valid id or email_address must be passed in" });
        } else {

            let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
            let sqlStr;
            if(opts.id) {
                sqlStr = `SELECT ${cols} FROM ${TABLE_NAME} WHERE id=${parseInt(opts.id)}`;
            } else {
                sqlStr = `SELECT ${cols} FROM ${TABLE_NAME} WHERE email_address=${this.dbescape(opts.email_address)}`;
            }

            //add these when we're looking for valid users to login
            if( opts.active ){
                sqlStr += " AND active=1"
            }
            if( opts.verified ){
                sqlStr += " AND verified=1"
            }
            sqlStr += ";"

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

    findForgotPW(opts,cb){
        if( !opts.id && !opts.token ){
            cb({ error_type: "user", error: "id and token must be passed in" });
        } else {
            this.globals.logger.debug( `${MODEL_NAME}.findForgotPW() :: opts: `, opts );

            let sqlStr = `CALL findForgotPW(${this.dbescape(opts.id)}, ${this.dbescape(opts.token)});`;

            this.globals.logger.debug( `${MODEL_NAME}.findForgotPW() sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.findForgotPW() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug(`${MODEL_NAME}.findForgotPW() result?: `, result[0][0]);
                    if(result[0].length > 0 ){
                        cb(null,result[0][0]);
                    } else {
                        cb(null, { id: 0 })
                    }

                }
            });
        }
    }

    forgotPW(opts,cb){
        if( !opts.email_address ){
            cb({ error_type: "user", error: "email_address must be passed in" });
        } else {
            let sqlStr = `CALL forgotPW(${this.dbescape(opts.email_address)});`;

            this.globals.logger.debug( `${MODEL_NAME}.forogtPW() sqlStr: ${sqlStr}` );

            this.execSQL(this.db, sqlStr, (error, result) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.forogtPW() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    this.globals.logger.debug(`${MODEL_NAME}.forogtPW() result?: `, result[0][0]);
                    cb(null,result[0][0]);
                }
            });
        }
    }

    getUser(opts,cb){
        if( !parseInt(opts.id) && !opts.email_address){
            cb({ error_type: "user", error: "An id or email_address must be passed in" });
        } else if( parseInt(opts.id) <= 0 && opts.email_address === ""){
            cb({ error_type: "user", error: "A valid id or email_address must be passed in" });
        } else {
            let email_address_str = this.dbescape(opts.email_address).replace(/\'/g,"")
            let user_id = parseInt(opts.id) || 0;

            let getUserSQL = `CALL getUser(${user_id},"${email_address_str}");`
            this.globals.logger.debug(`${MODEL_NAME}.getUser() getUserSQL: ${getUserSQL}`);

            this.execSQL(this.db, getUserSQL, (error, results) => {
                if (error) {
                    this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR : `, error);
                    cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                } else {
                    /*
                       results array and their order that will come back in the DBAL
                      0 - the user
                      1 - groups a member of
                      2 - access_level results
                      3 - group_owners results
                      4 - reports for the user
                      5 - user acct
                      6 - user payment history (last 6 rows)
                      7 - classes the user teaches
                    */

                    let user = {}, tmp
                    if( results[0].length > 0 ){
                        try {
                            user = JSON.parse( JSON.stringify( results[0][0] ) )
                            tmp = JSON.parse( results[0][0].data )
                            user.data = tmp
                        } catch(e){
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR :: parsing results[0].data: `, e);
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR :: results[0].data: `, results[0][0]);
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR :: results[0].data: `, results[0][0].data);
                            return cb(e)
                        }
                    } else {
                        this.globals.logger.error(`${MODEL_NAME}.getUser() :: No user found: `, opts);
                        return cb(null, false)
                    }

                    //groups a member of
                    user.groups = []
                    if( results[1].length > 0 ){
                        try {
                            tmp = JSON.parse( JSON.stringify( results[1] ) )
                            user.groups = tmp

                            user.groups.forEach((r, i) => {
                                user.groups[i].data = JSON.parse( r.data )
                            })
                        } catch(e){
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR parsing results[1]: `, e);
                        }
                    }

                    //user's access level
                    user.access_level = 0
                    if( results[2].length > 0 ){
                        try {
                            tmp = JSON.parse( JSON.stringify( results[2][0] ) )
                            user.access_level = parseInt(tmp.access_level) || 0
                        } catch(e) {
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR parsing results[2][0]: `, e);
                        }
                    }

                    //groups owned
                    user.groups_owned = []
                    if( results[3].length > 0 ){
                        try {
                            tmp = JSON.parse( JSON.stringify( results[3] ) )
                            user.groups_owned = tmp
                        } catch(e) {
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR parsing results[3]: `, e);
                        }
                    }

                    //user's reports
                    user.reports = []
                    if( results[4].length > 0 ){
                        try {
                            tmp = JSON.parse( JSON.stringify( results[4] ) )
                            user.reports = tmp

                            user.reports.forEach((r, i) => {
                                user.reports[i].data = JSON.parse( r.data )
                            })
                        } catch(e) {
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR parsing results[4]: `, e);
                        }
                    }

                    //user's account
                    user.account = {}
                    if( results[5].length > 0 ){
                        try {
                            tmp = JSON.parse( JSON.stringify( results[5][0] ) )
                            user.account = tmp
                        } catch(e) {
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR parsing results[5]: `, e);
                        }
                    }

                    //user's payment history
                    user.payment_history = []
                    if( results[6].length > 0 ){
                        try {
                            tmp = JSON.parse( JSON.stringify( results[6] ) )

                            //get payment history if it's there
                            if(tmp.length > 0) {
                                user.payment_history = tmp
                            }
                        } catch(e) {
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR parsing results[6]: `, e);
                        }
                    }

                    user.teaching = []
                    if( results[7].length > 0 ){
                        console.log(`${MODEL_NAME}.getUser() :: user teaching?: `, results[7])
                        try {
                            tmp = JSON.parse( JSON.stringify( results[7] ) )

                            if(tmp.length > 0) {
                                user.teaching = tmp
                            }
                        } catch(e) {
                            this.globals.logger.error(`${MODEL_NAME}.getUser() :: ERROR parsing results[7]: `, e);
                        }
                    }

                    this.globals.logger.debug(`${MODEL_NAME}.getUser() result?: `, user);
                    cb(null,user);
                }
            })
        }
    }

    //the signup method calls a different db proc
    signup(opts,cb){
        //create the user from the data we've been given

        let sqlStr = `CALL createUser('${JSON.stringify(opts)}');`
        this.execSQL(this.db, sqlStr, (error, result) => {
            if (error && error.toString().indexOf("ER_DUP_ENTRY") > -1 ) {
                this.globals.logger.error(`${MODEL_NAME}.signup() :: DUPLICATE ENTRY ERROR : `, error);
                cb({ error_type: "user", error: "DUPLICATE_EMAIL" });
            } else if (error) {
                this.globals.logger.error(`${MODEL_NAME}.signup() :: ERROR : `, error);
                cb({ error_type: "system", error: "SYSTEM" });
            } else if( result !== null ){
                this.globals.logger.debug(`${MODEL_NAME}.signup() db result?: `, result);

                cb(null,result);
            } else {
                cb(null, false)
            }
        });
    }

    //this is meant for CRUD operations on the admin screens
    create(obj, cb){
        //need more resilience: send back which columns are invalid?
        let colErrors = [];

        let local_valid_cols = JSON.parse( JSON.stringify( VALID_COLS ) );

        //START remove sensitive data
        let search_index = local_valid_cols.indexOf("forgot_password_token");
        if (search_index > -1) {
            local_valid_cols.splice(search_index, 1);
        }
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
                    let getUserSQL = `CALL getUser(${result.insertId});`
                    this.globals.logger.debug(`${MODEL_NAME}.create() getUserSQL: ${getUserSQL}`);

                    this.execSQL(this.db, getUserSQL, (error, result) => {
                        if (error) {
                            this.globals.logger.error(`${MODEL_NAME}.create() :: ERROR : `, error);
                            cb({ error_type: "system", error: "A system error has occurred, please contact support" });
                        } else {
                            this.globals.logger.debug(`${MODEL_NAME}.create() result?: `, result[0][0]);
                            cb(null,result[0][0]);
                        }
                    })
                } else {
                    cb(null, false)
                }
            });
        }
    }

    confirmRegistration(obj, cb){

        let updateStr = `UPDATE ${TABLE_NAME} SET invite_token='', verified = 1 `;
        updateStr += `WHERE ${IDENTITY_COL} = ${this.dbescape(obj.id)} AND invite_token = ${this.dbescape(obj.token)} AND active = 1;`;

        let cols = `${IDENTITY_COL},${VALID_COLS.join(',')},${CREATED_AT_COL},${UPDATED_AT_COL}`;
        let sqlStr = `SELECT ${cols} FROM ${TABLE_NAME} where id=${this.dbescape(obj.id)} LIMIT 1;`;

        updateStr = `${updateStr}${sqlStr}`;

        this.globals.logger.info(`${MODEL_NAME}.confirmRegistration() updateStr: ${updateStr}`);

        this.execSQL(this.db, updateStr, (error, result) => {
            if (error) {
                this.globals.logger.error(`${MODEL_NAME}.confirmRegistration() :: ERROR : `, error);
                cb({ error_type: "system", error: "A system error has occurred, please contact support" });
            } else if( result[2].length === 0 ){
                cb({ error_type: "user", error: "User does not exist" });
            } else {
                this.globals.logger.info(`${MODEL_NAME}.confirmRegistration() result? BEFORE MODS: `, result);

                let user = result[2][0];

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

        if( colErrors.length > 0 ){
            cb({ error_type: "user", "error": colErrors });
        } else {
            obj.updated_at = new Date();

            //json to  col -> val
            let updateStr = "";
            Object.keys( obj ).map( (col) => {
                if(col === 'data'){
                    updateStr += `${col}='${JSON.stringify(obj[col])}',`;
                } else {
                    updateStr += `${col}=${this.dbescape(obj[col])},`;
                }
            });
            //remove the last comma
            updateStr = updateStr.slice(0,-1);

            let sqlStr = `UPDATE ${TABLE_NAME} SET ${updateStr} `;
            sqlStr += `where ${IDENTITY_COL} = ${this.dbescape(vals.id)};`;

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

    //logical delete only
    delete(id, cb){
        // let sqlStr = `DELETE FROM ${TABLE_NAME} WHERE id=${this.dbescape(id)}`;
        let sqlStr = `UPDATE ${TABLE_NAME} SET active=0 WHERE id=${this.dbescape(id)}`;

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

module.exports = User;
