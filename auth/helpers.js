'use strict';

const db = require(`../db/db`);

const loginRequired = (req, res, next) => {
  if (!req.user) {
    if (req.wantsJson) {
      return res.status(401).json({ status: 'Please log in' });
    }

    return next({ status : 401, message : `Please log in` });
  }
  return next();
}

const adminRequired = (req, res, next) => {
  if (!req.user) {
    if (req.wantsJson) {
      return res.status(401).json({ status: 'Please log in' });
    }
    return res.status(401).redirect(`/auth/login`);
  }
  return db.models.user.fetchByEmail(req.user.email)
  .then(user => {
    // console.log(user);
    if (!user || user.role !== `admin`) {
      res.status(401).json({ status: 'You are not authorized' });
      return null;
    }
    next();
    return null
  })
  .catch(err => {
    console.log(err);
    return res.status(500).json({ status: 'Something bad happened' });
  });
}

const loginRedirect = (req, res, next) => {
  if (req.user) {
    if (req.wantsJson) {
      return res.status(401).json({ status: 'You are already logged in' });
    }

    if (req.user.role === `admin`) {
      res.redirect(`/admin`);
      return null;
    }

    res.redirect(`/`);
    return null;
  }
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

