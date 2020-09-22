/*
    DBAL for PoppitCompanies
*/
const mysql = require('mysql');

const getTime = require('../lib/globals.js').getTime;

let execSQL = (sqlStr, cb) => {
    console.log("SQL STRING: ", sqlStr);
    this.connection.query(sqlStr, function (error, result, fields) {
        if (error) {
            cb(error);
        } else {
            cb(null,result);
        }
    });
};

class Company {
    constructor(c) {
        this.connection = c;
    }

    execSQL(sqlStr, cb){
        console.log("SQL STRING: ", sqlStr);
        this.connection.query(sqlStr, function (error, result, fields) {
            if (error) {
                cb(error);
            } else {
                cb(null,result);
            }
        });
    };

    find(opts,cb){
        let sqlStr = "select `name`,`description`,`first_name`,`last_name`,`email_address`,`password_hash`,`address`,`city`,`state`,`zip`,`created_at`,`updated_at` from poppit_companies where id=" + mysql.escape(opts.id) + " limit 1;";

        this.execSQL(sqlStr, (error, result) => {
            if (error) {
                cb(error);
            } else {
                console.log( getTime() + " - Companies.find() result?: ", result[0]);
                cb(null,result[0]);
            }
        });
    }

    create(vals, cb){
        let cols = ["name","description","first_name","last_name","email_address","password_hash","address","city","state","zip","updated_at","created_at"];

        vals.updated_at = "NOW()";
        vals.created_at = "NOW()";

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            let sqlStr = "insert into poppit_companies SET " +mysql.escape(vals)+ ";";

            execSQL(sqlStr, function(error, result){
                if (error) {
                    cb(error);
                } else {
                    console.log(getTime() + " - Companies.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    update(vals, cb){

        //we need to filter the cols we're really using
        let cols = ["name","description","first_name","last_name","email_address","password_hash","address","city","state","zip"];

        //only update what's been given to us
        let valCols = Object.keys(vals);

        if( valCols.filter(el => cols.indexOf(el) < 0).length > 0 ){
            cb({ "error": "invalid_data" });
        } else {
            vals.updated_at = "NOW()";
            let sqlStr = "update poppit_companies SET " +mysql.escape(vals)+ ";";

            execSQL(sqlStr, function(error, result){
                if (error) {
                    cb(error);
                } else {
                    console.log(getTime() + " - Companies.create() result?: ", result);
                    cb(null,result);
                }
            });
        }
    }

    delete(id, cb){
        let sqlStr = 'delete from poppit_companies where id=' + id;
        execSQL(sqlStr, function(error, result){
            if (error) {
                cb(error);
            } else {
                cb(null, result);
            }
        });
    }
}

module.exports = Company;