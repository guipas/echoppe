'use strict';

module.exports = (req, res, next) => {
  const acc = req.accepts(['html', 'json']);
  req.wantsJson = acc === 'json';
  next();
};
