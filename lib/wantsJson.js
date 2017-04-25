'use strict';

module.exports = (req, res, next) => {
  req.wantsJson = req.accepts([`html`, `json`]) === `json`;
  return next();
};
