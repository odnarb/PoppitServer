module.exports = (globals) => {
    main: return (error, req, res, next) => {
        if(error) {
            globals.logger.debug(`ERROR HANDLER: res: ${res.statusCode} :: xhr?: ${req.xhr} :: error: `, error);

            if( req.xhr ) {
                const util = require('util');
                return res.status(res.statusCode).json({ status_code: error.status, status: "error", err_msg: error })
            } else {
                let errPage = globals.errorPages[error.status];
                if ( errPage === undefined ) {
                    errPage = 'generalError';
                }
                let errPageStr = 'errors/'+errPage+'.ejs';
                return res.status(error.status).render(errPageStr);
            }
        }
        next();
    }
};
