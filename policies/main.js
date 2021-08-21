module.exports = (globals) => {
    return (req, res, next) => {
        const routeHeader = "main() policy"

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
            req.url.indexOf('/user/confirm') > -1 ||
            req.url === '/user/logout' ||
            req.url === '/user/newpassword' ||
            req.url === '/appuser/login' ||
            req.url === '/csrf'
        );

        if (req.method !== "GET") {
          globals.logger.debug( `${routeHeader} :: Most likely a post method..no res.locals needed` )
          next()
        } else {
          //this is a GET method, so we're most likely going to be rendering a view that needs res.locals
          req.app.locals.appName    = process.env.APP_NAME;
          req.app.locals.appRelease = process.env.APP_RELEASE;
          req.app.locals.appEnv     = process.env.NODE_ENV;
          // req.app.locals.sentryKey  = process.env.SENTRY_KEY;
          req.app.locals.appLogo    = process.env.APP_LOGO;
          req.app.locals.appIcon    = process.env.APP_ICON;
          req.app.locals.url        = process.env.APP_URL;
        }

        if( allowRequest ) {
            next();

        // check session... show login or show dashboard
        } else if( req.url !== '/user/login' && req.session.isLoggedIn ){
            next();

        // user needs to login
        } else if( req.url !== '/user/login' && req.session.isLoggedIn === undefined || req.session.isLoggedIn === false ) {
            return res.redirect('/user/login');
        // user is logging in
        } else {
            next();
        }
    };
};
