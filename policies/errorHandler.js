module.exports = (globals) => {
    main: return (error, req, res, next) => {
        if(error) {
            globals.logger.debug("ERROR HANDLER: error: ", error);
            globals.logger.debug("ERROR HANDLER: res? ", res.statusCode);

            if( req.xhr ) {
                globals.logger.debug("ERROR HANDLER :: XHR/AJAX ERROR :: ", error);
                globals.logger.error("ERROR HANDLER:: XHR/AJAX :: ", error);

                const util = require('util');
                return res.status(res.statusCode).json({ status_code: error.status, status: "error", err_msg: error })
            } else {
                globals.logger.debug("ERROR HANDLER :: HTTP :: ", error);
                globals.logger.error("ERROR HANDLER:: HTTP :: ", error);

                let errPage = globals.errorPages[error.status];
                if ( errPage === undefined ) {
                    errPage = 'generalError';
                }

                globals.logger.debug(`ERROR HANDLER :: HTTP ERROR :: Error ${error.status} :: ${req.method} ${req.url}`);

                let errPageStr = 'errors/'+errPage+'.ejs';
                return res.status(error.status).render(errPageStr);
            }
        }

        next();
    }
};
