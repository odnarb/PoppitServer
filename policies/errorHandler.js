module.exports = (globals) => {
    main: return (error, req, res, next) => {
        if(error) {
            globals.logger.error("ERROR: ", error);

            let errPage = globals.errorPages[error.status];

            if ( errPage === undefined ) {
                errPage = 'generalError';
            }

            globals.logger.error(`Error ${error.status} :: ${req.method} ${req.url}`);

            let errPageStr = 'errors/'+errPage+'.ejs';
            return res.status(error.status).render(errPageStr);
        }
        next();
    }
};
