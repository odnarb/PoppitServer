module.exports = (opts) => {

    const winston = require('winston');
    const mysql = require('mysql');

    let module = {};

    module.salt_rounds = 10;

    //init the db object
    module.db = {};

    module.errorPages = {
        '400': '400',
        '401': '401',
        '403': '403',
        '500': '500',
        '502': '502',
        '503': '503'
    };

    module.dbescape = mysql.escape;

    module.execSQL = (db, sqlStr, cb) => {
        module.logger.debug("SQL STRING: ", sqlStr);

        db.query(sqlStr, (error, result, fields) => {
            if (error) {
                cb(error);
            } else {
                cb(null,result);
            }
        });
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

            if( info[Symbol.for("splat")] && info[Symbol.for("splat")].length > 0 ){
                const util = require('util');
                let numSplats = info[Symbol.for("splat")].length;
                for(let i=0; i < numSplats; i++){
                    msg += " : " + util.inspect( info[Symbol.for("splat")][i] );
                }
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
        module.logger.info("TODO: Implement sendEmail()");
        cb();
    };

    return module;
};