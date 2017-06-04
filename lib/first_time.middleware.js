'use strict';

const firstTime = require(`./first_time`);

const firstTimeMiddleware = (req, res, next) => {
  firstTime.connecting()
  .then(isFirstTime => {
    // console.log(req.path);
    // console.log(req.baseUrl);
    // console.log(req.originalUrl);
    if (isFirstTime && !req.originalUrl.match(/\/auth\/register\/?/)) {
      res.redirect(`/auth/register`);
      return null;
    }

    next();
    return null;
  })
}

module.exports = firstTimeMiddleware;
