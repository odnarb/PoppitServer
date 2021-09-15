module.exports = (globals) => {
    return (error, req, res, next) => {
        if( res.headersSent ) {
            console.log(`---req.method / req.url: `, req.method, req.url)
            console.log("HEADERS ALREADY SENT: ", error)
        } else {
            try {
                if(error) {
                    //if we got here and the status code is still 200, change it to an error
                    if( res.statusCode === 200 ){
                        res.statusCode = 500
                    }

                    globals.logger.debug(`ERROR HANDLER: res: ${res.statusCode} :: xhr?: ${req.xhr} :: error: `, error);

                    if( req.xhr ) {
                        return res.status(res.statusCode).json({ status_code: error.status, status: "error", err_msg: "Server Error" });
                    } else {
                        let error_id = error.status||res.statusCode
                        let errPage = globals.errorPages[error_id];

                        if ( errPage === undefined ) {
                            errPage = 'generalError';
                        }
                        let errPageStr = 'errors/'+errPage+'.ejs';

                        let error_layout = (req.session.user && req.session.id > 0)? 'layout' : 'login_layout'

                        //for the error handler, we need to set the variable in res.locals
                        return res.status(error.status||res.statusCode).render(errPageStr, {
                            pageTitle: `${res.statusCode} Error`,
                            error_status: res.statusCode,
                            layout: error_layout
                        });
                    } //end if(req.xhr)

                } //end if(error)
            } catch(e) {
                globals.logger.debug(`ERROR HANDLER :: CATCH :: error: `, e);
                return res.status(500).json({ status: "500 Internal Server Error"});
            }
        }
    } //return()
};
