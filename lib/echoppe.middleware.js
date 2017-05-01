'use strict';

const db = require(`../db/db`);

const middleware = (req, res, next) => {
  req.echoppe = {
    db
  }
  next();
  return null;
}


module.exports = middleware;
