'use strict'

module.exports = (req, res, next) => {
  // if (req.session.isAdmin === true) {
  if (req.shop.user.isAdmin === true) {
    console.log('user is admin !');
    next();
  } else {
    next({ status : 401, message : `You are not allowed to to that` });
  }
}