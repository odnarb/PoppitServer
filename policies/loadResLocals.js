module.exports = (globals) => {
  return (req, res, next) => {
    const routeHeader = "loadResLocals() policy"

    globals.logger.debug(`${routeHeader} :: --------------------- BEGIN`)

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
      req.app.locals.appFavicon = process.env.APP_FAVICON;
      req.app.locals.appIcon    = process.env.APP_ICON;
      req.app.locals.url        = process.env.APP_URL;

      if( res.locals.originalUrl === undefined ) {
          res.locals.originalUrl = req.originalUrl
      }

      if( res.locals.error_status === undefined ) {
          res.locals.error_status = ''
      }

      if(res.locals.globals === undefined) {
        res.locals.globals = globals
      }
      if(res.locals.require === undefined) {
        res.locals.require = require
      }

      globals.logger.debug(`${routeHeader} :: res.locals set..`)
      globals.logger.debug(`${routeHeader} :: --------------------- END`)

      if( res.locals.pageTitle === undefined ) {
        res.locals.pageTitle = ""
      }
      next()
    }
  };
};