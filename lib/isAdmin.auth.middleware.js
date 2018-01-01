'use strict'

module.exports = (req, res, next) => {
  if (req.shop.user.isAdmin === true) {
    console.log('user is admin !');
    next();
  } else {
    next({ status : 401, message : `Sorry, you are not allowed to do that.` });
  }
};
