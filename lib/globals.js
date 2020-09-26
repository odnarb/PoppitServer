module.exports = (opts) => {

    const winston = require('winston');
    const mysql = require('mysql');

    let module = {};

    //init the db object
    module.db = {};

    module.dbescape = mysql.escape;

    module.execSQL = (db, sqlStr, cb) => {
        console.log("SQL STRING: ", sqlStr);

        db.query(sqlStr, (error, result, fields) => {
            if (error) {
                cb(error);
            } else {
                cb(null,result);
            }
        });
    };

    module.sqlCB = (error, result, cb) => {
        if (error) {
            cb(error);
        } else {
            console.log("CompanyCampaigns.find() result?: ", result[0]);
            cb(null,result[0]);
        }
    };

    module.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.printf((info) => {
            let msg = `[${info.timestamp}]`;
            if( info.label ){
                msg += ` [${info.label}] `;
            }
            if( info.label ){
                msg += ` [${info.label}] `;
            }
            if( info.level ){
                msg += ` [${info.level}] `;
            }

            msg += `- ${info.message}`;

            if( info[Symbol.for("splat")] ){
                const util = require('util');
                msg += " :: " + util.inspect( info[Symbol.for("splat")] );
            }
            return msg;
        })
      ),
      transports: [
        new winston.transports.Console({ level: opts.loglevel })
      ]
    });

    module.stringifyOrEmpty = (i) => {
        if(i == "") return "";
        var newStr = JSON.stringify(i);
        newStr = newStr.replace(/'/g, "\'\'");
        return newStr;
    };

    //TODO
    module.sendEmail = (email, cb) => {
        globals.logger.info("TODO: Implement sendEmail()");
        cb();
    };

    return module;
};