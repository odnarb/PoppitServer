module.exports = (opts) => {

    const winston = require('winston');
    const mysql = require('mysql');

    let module = {};

    //14 days
    module.COOKIE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

    //1 hr
    module.COOKIE_MIN_AGE = 60 * 60 * 1000;

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

    module.admin_registration_email = (user) => {
        delete user.password_hash;
        let html = `<p>A new user has registered!</p>`;
        html += `<p>user  information: <pre>${JSON.stringify(user, null, 4)}</pre></p>`;

        return {
            html: html,
            text: html.replace(/<br>/ig, '\n').replace(/<.*?>/g, '')
        };
    }

    module.user_registration_email = (opts) => {
        let {user} = opts;

        delete user.password_hash;

        let confirmation_url = `${process.env.APP_URL}/companyuser/confirm/${user.id}/${user.invite_token}`;

        let html = `<p>Hello, ${user.first_name}!<br />`
        html += `You've been invited to join ${process.env.APP_NAME} with your organization.</p>`;
        html += `<p>Please confirm your registration and activate your account by clicking the link below.</p>`;
        html += `<p>Once you goto the link you'll be prompted to create a new password for your account.</p>`;
        html += `<p><a target="_blank" href="${confirmation_url}">${confirmation_url}</a></p>`;
        html += `<p>Thank you,</p>`
        html += `<p>-The ${process.env.APP_URL} team</p>`;

        return {
            html: html,
            text: html.replace(/<br>/ig, '\n').replace(/<.*?>/g, '')
        };
    }

    module.sendEmail = (email, cb) => {
        const mailer = require('nodemailer');

        const creds = {
            service: "gmail",
            auth: {
                user: process.env.ADMIN_EMAIL_LOGIN,
                pass: process.env.ADMIN_EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        }

        try {
            const transporter = mailer.createTransport(creds);
            transporter.sendMail(email, (err, res) => {
                cb(err,res)
            })
        } catch (e) {
            cb(e)
        }
    };

    return module;
};