module.exports = (globals) => {
    return (req, res, next) => {
        //quick health check
        if( req.url == "/ping?health-check=1" ){
            return res.json({ success: true })
        }

        const routeHeader = "main() policy"

        globals.logger.debug(`${routeHeader} :: --------------------- BEGIN`)

        //init session vars and info
        if( req.session.isLoggedIn === undefined ) {
            req.session.isLoggedIn = false;
        }

        globals.logger.debug(`${routeHeader} :: ${req.method}, ${req.url}`);

        if ( globals.allowedMethods.includes(req.method) === false ) {
            return res.sendStatus(404);
        }

        if( globals.allowPassThruRequest(req.url) === true) {
            globals.logger.debug(`${routeHeader} :: allowPassThruRequest TRUE`);
            globals.logger.debug(`${routeHeader} :: --------------------- END`)
            next();
        } else if( globals.loginPageRequest(req.url) === true ) {
            globals.logger.debug(`${routeHeader} :: loginPageRequest TRUE`);
            globals.logger.debug(`${routeHeader} :: --------------------- END`)
            next();
        } else if( req.session.needsNewpassword === true ){
            globals.logger.debug(`${routeHeader} :: needsNewpassword TRUE`);
            globals.logger.debug(`${routeHeader} :: --------------------- END`)
            //grab the query params and pass to the redirect
            let queryStr = Object.keys(req.query).map(key => `${key}=${req.query[key]}`).join('&');
            if( queryStr !== '' ){
                queryStr = "?" + queryStr
            }
            res.redirect('/user/newpassword' + queryStr)
        } else if( globals.loginPageRequest(req.url) === false && req.session.isLoggedIn === false ) {
            //grab the query params and pass to the redirect
            let queryStr = Object.keys(req.query).map(key => `${key}=${req.query[key]}`).join('&');
            if( queryStr !== '' ){
                queryStr = "?" + queryStr
            }
            globals.logger.debug(`${routeHeader} ::  REDIRECTING TO LOGIN PAGE (with queryStr?): `, queryStr)
            globals.logger.debug(`${routeHeader} :: --------------------- END`)
            res.redirect('/user/login' + queryStr)
        } else if( globals.loginPageRequest(req.url) === false && req.session.isLoggedIn === true ){
            globals.logger.debug("main policy :: ALLOW APP PAGES");

            next();
        } else {
            globals.logger.debug(`${routeHeader} :: USER IS LOGGING IN`);
            globals.logger.debug(`${routeHeader} :: --------------------- END`)
            next();
        }
    };
};