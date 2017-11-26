'use strict';

// handle middlewares that return promises (or async middlewares)
const safeHandle = middleware => (req, res, next) => middleware(req, res, next).catch(err => { console.log(err); next(err)});

module.exports = safeHandle;
