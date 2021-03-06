'use strict'

const log = require('./debugLog').log;

module.exports = (req, res, next) => {
  if (req.shop.user.isAdmin === true) {
    log('user is admin !');
    next();
  } else {
    if (req.wantsJson) {
      return next({ status : 401, message : `Sorry, you are not allowed to do that.` });
    }
    res.redirect('/admin/login');
  }
};
