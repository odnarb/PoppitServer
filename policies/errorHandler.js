module.exports = (globals) => {
    return (error, req, res, next) => {
        if(error) {
            globals.logger.debug(`ERROR HANDLER: res: ${res.statusCode} :: xhr?: ${req.xhr} :: error: `, error);

            if( req.xhr ) {
                const util = require('util');
                return res.status(res.statusCode).json({ status_code: error.status, status: "error", err_msg: error });
            } else {
                let error_id = error.status||res.statusCode
                let errPage = globals.errorPages[error_id];

                if ( errPage === undefined ) {
                    errPage = 'generalError';
                }
                let errPageStr = 'errors/'+errPage+'.ejs';

                //for the error handler, we need to set the variable in res.locals
                return res.status(error.status||res.statusCode).render(errPageStr, {
                    pageTitle: `${res.statusCode} Error`,
                    error_status: res.statusCode
                });
            }
        }
        next();
    };
};
