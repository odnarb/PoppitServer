module.exports = (opts) => {

    const winston = require('winston');
    const mysql = require('mysql');

    // configure AWS SDK
    // let aws = require('aws-sdk');
    // aws.config.loadFromPath(process.cwd() + '/aws_config.json');

    let module = {};

    let emailSignature = '<hr />'
        emailSignature += '<p>Thank you,<br />'
        emailSignature += `The ${process.env.APP_NAME} Team<br />`
        emailSignature += `<a href="${process.env.APP_URL}" target=_blank">${process.env.APP_URL}</a></p>`
        emailSignature += `<p><a href="${process.env.APP_URL}"><img src="${process.env.APP_URL}/${process.env.APP_LOGO}" alt="${process.env.APP_NAME}" title="${process.env.APP_NAME}" style="width:256px" /></a></p>`

    //14 days
    module.COOKIE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

    //1 hr
    module.COOKIE_MIN_AGE = 60 * 60 * 1000;

    module.DEFAULT_USER_TYPE = 1;

    module.USER_TYPES = {
        ADMIN: 1,
        SUPPORT: 2,
        ADVERTISER: 3,
        USER: 4
    }

    module.salt_rounds = 10;

    module.NOTIFICATION_TYPES = {
       registration: 1,
       billing: 2,
       forgot_password: 3
    }

    module.NOTIFICATION_STATUS = {
        PENDING: 1,
        SENT: 2,
        ERROR: 3
    }

    module.NOTIFICATION_METHODS = {
        sms: 1,
        fb_messenger: 2,
        whatsapp: 3,
        email: 4
    }

    module.REGISTRATION_STATUS = {
        PENDING: 1,
        VERIFIED: 2,
        PAID: 3,
        REGISTERED_VOXY: 4,
        EXPIRED: 5,
        ERROR: 6,
    }

    //init the db object
    module.db = {};

    module.allowedMethods = ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'];

    module.errorPages = {
        '400': '400',
        '401': '401',
        '403': '403',
        '500': '500',
        '502': '502',
        '503': '503'
    };

    module.isStaticRequest = (url) => {
        if( url.split('.').length > 1 ){
            return true
        }
        return false
    };

    //special, such that
    module.loginPageRequest = (url) => {
        return (
            url.indexOf('/user/confirm') > -1 ||
            url.indexOf('/user/signup') > -1 ||
            url.indexOf('/user/logout') > -1 ||
            url.indexOf('/user/newpassword') > -1 ||
            url.indexOf('/user/forgotpassword') > -1 ||
            url.indexOf('/user/login') > -1
        )
    };

    //some generic endpoints
    module.allowPassThruRequest = (url) => {
        return (
            url.indexOf('/email/delivery') > -1
            || url.indexOf('/email/bounce') > -1
            || url.indexOf('/email/complaint') > -1
            || url.indexOf('/email/unsubscribe') > -1
        );
    };

    module.dbescape = mysql.escape;

    module.execSQL = (db, sqlStr, cb) => {
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

    module.get_app_info = () => {
        return {
            APP_NAME: process.env.APP_NAME,
            APP_URL: process.env.APP_URL,
            APP_LOGO: process.env.APP_LOGO,
            APP_ICON: process.env.APP_ICON,
            emailSignature: emailSignature
        }
    }

    module.forgotpw_email = (user) => {

        let forgotpw_url = `${process.env.APP_URL}/user/forgotpassword/${user.id}/${user.token}`;

        let html = `<p>Hello, please click the link below to reset your password.</p>`
        html += `<p>Saludos, favor hacer clic en el enlace de abajo para restablecer su contraseña.</p>`
        html += `<p><a target="_blank" href="${forgotpw_url}">${forgotpw_url}</a></p>`;
        html += emailSignature

        return {
            html: html,
            text: html.replace(/<br \/>/ig, '\n').replace(/<.*?>/g, '')
        };
    }

    module.admin_registration_email = (user) => {
        delete user.password_hash;
        let html = '<p>A new user has registered with the platform!</p>'
        html += '<p>User information<br/>'
        html += `<strong>User ID:</strong> ${user.id}<br />`
        html += `<strong>First Name:</strong> ${user.first_name}<br />`
        html += `<strong>Last Name:</strong> ${user.last_name}<br />`
        html += `<strong>Email:</strong> ${user.email_address}<br />`
        html += `<strong>Phone:</strong> ${user.phone}<br /></p>`
        html += `<strong>Registration URL used:</strong> ${user.registration_url}<br /></p>`
        html += emailSignature

        return {
            html: html,
            text: html.replace(/<br \/>/ig, '\n').replace(/<.*?>/g, '')
        };
    }

    module.user_registration_email = (user) => {
        delete user.password_hash;

        let confirmation_url = `${process.env.APP_URL}/user/confirm/${user.id}/${user.invite_token}`;

        let html = `<p>Hello, ${user.first_name}!<br />`
        html += `Thank you for registering with ${process.env.APP_NAME}.</p>`;
        html += `<p>Please confirm your registration and activate your account by clicking the link below.</p>`;
        html += `<p>Once you go to the link you'll be prompted to create a new password for your account.</p>`;

        html += `<p><hr /><p/>`

        html += `<p>¡Hola, ${user.first_name}!<br />`
        html += `Gracias por registrarse en el portal de ${process.env.APP_NAME}.</p>`;
        html += `<p>Favor confirmar su suscripción y activar su cuenta haciendo clic en el enlace a continuación.</p>`;
        html += `<p>Una vez que acceda al enlace, se le pedirá que cree una nueva contraseña para su cuenta.</p>`;

        html += `<p><a target="_blank" href="${confirmation_url}">${confirmation_url}</a></p>`;
        html += emailSignature

        return {
            html: html,
            text: html.replace(/<br \/>/ig, '\n').replace(/<.*?>/g, '')
        };
    }

    module.sendEmail = (email, cb) => {
        const mailer = require('nodemailer');

        try {
            const transporter = mailer.createTransport({
                SES: new aws.SES({
                    apiVersion: '2010-12-01'
                })
            });
            transporter.sendMail(email, (err, res) => {
                cb(err,res)
            })
        } catch (e) {
            cb(e)
        }
    };

    return module;
};