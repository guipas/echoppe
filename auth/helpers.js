'use strict';

const db = require(`../db`);

const loginRequired = (req, res, next) => {
  if (!req.user) return res.status(401).json({ status: 'Please log in' });
  return next();
}

const adminRequired = (req, res, next) => {
  if (!req.user) res.status(401).json({status: 'Please log in'});
  return db.models.user.findOne({ email : req.user.email })
  .then((user) => {
    if (!user || user.role !== `admin`) {
      return res.status(401).json({ status: 'You are not authorized' })
    }
    return next();
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({ status: 'Something bad happened' });
  });
}

const loginRedirect = (req, res, next) => {
  if (req.user) return res.status(401).json(
    { status: 'You are already logged in' });
  return next();
}

const validateCredentials = req => {
  return new Promise((resolve, reject) => {
    if (req.body.password.length < 6) {
      reject({
        message : 'Password must be longer than 6 characters',
        code : 400,
      })
    } else {
      resolve();
    }
  });
}

module.exports = {
  loginRequired,
  adminRequired,
  loginRedirect,
  validateCredentials,
}

