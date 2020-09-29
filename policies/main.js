module.exports = (globals) => {
    return (req, res, next) => {
        // const allowedMethods = ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'];

        // // globals.logger.info("main policy :: METHOD: ", req.method);

        // if (!allowedMethods.includes(req.method)) {
        //     return res.sendStatus(404);
        // }

        // if ( !req.session ) {
        //     req.session = {};
        // }

        // // check session... show login or show dashboard
        // if( req.url == '/' && !req.session.isLoggedIn ) {
        //     globals.logger.debug( "User NOT logged in..routing to login page" );
        //     return res.redirect('/user/login');
        // }

        // if( req.url == '/user/login' && req.session.isLoggedIn ) {
        //     globals.logger.debug( "User logged in..routing to dashboard" );
        //     return res.redirect('/');
        // }
        next();
    };
};
