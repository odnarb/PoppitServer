module.exports = (globals) => {
    return (req, res, next) => {
        const allowedMethods = ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'];

        // const allowUrls = [
        // ];

        // globals.logger.info("main policy :: METHOD: ", req.method);

        if (!allowedMethods.includes(req.method)) {
            return res.sendStatus(404);
        }

        //if assets, allow through
        let allowRequest = (
            req.url.indexOf('/assets') > -1 ||
            req.url.indexOf('/companyuser/confirm') > -1 ||
            req.url === '/companyuser/logout' ||
            req.url === '/companyuser/newpassword' ||
            req.url === '/appuser/login' ||
            req.url === '/csrf'
        );

        if( allowRequest ) {
            next();

        // check session... show login or show dashboard
        } else if( req.url !== '/companyuser/login' && req.session.isLoggedIn ){
            next();

        // user needs to login
        } else if( req.url !== '/companyuser/login' && req.session.isLoggedIn === undefined || req.session.isLoggedIn === false ) {
            return res.redirect('/companyuser/login');
        // user is logging in
        } else {
            next();
        }
    };
};
