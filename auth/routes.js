'use strict';

const express = require(`express`);
const router = express.Router();
const db = require(`../db/db`);
const passport = require('passport');
const helpers = require('./helpers.js');

const handleResponse = (res, code, statusMsg) => {
  res.status(code).json({ status: statusMsg });
}

router.get(`/register`, (req, res, next) => {
  res.render(`register`, { _csrf : req.csrfToken() });
});

router.get(`/login`, (req, res, next) => {
  res.render(`login`, { _csrf : req.csrfToken() });
});

router.post(`/register`, helpers.loginRedirect, (req, res, next) =>
  helpers.validateCredentials(req)
  // .then(() => db.models.user.create({
  //   email : req.body.email,
  //   password : req.body.password,
  // }))
  .then(() => db.models.user.count())
  .then(usersCount => db.models.user.make({
    email : req.body.email,
    password : req.body.password,
    role : usersCount === 0 ? `admin` : null,
  }))
  .then(user => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.log(err);
        throw new Error(err);
      }
      if (user) {
        handleResponse(res, 200, 'success');
      }
      else  handleResponse(res, 500, 'error');
    })(req, res, next);
    return null;
  })
  .catch(err => {
    console.log(`Error`);
    console.log(err);
    if (err && err.code && err.message) return handleResponse(res, err.code, err.message);
    return handleResponse(res, 500, 'error');
  })
)


router.post('/login', helpers.loginRedirect, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { handleResponse(res, 500, 'error'); }
    if (!user) { handleResponse(res, 404, 'User not found'); }
    if (user) {
      req.logIn(user, function (err) {
        if (err) { handleResponse(res, 500, 'error'); }
        handleResponse(res, 200, 'success');
      });
    }
  })(req, res, next);
});

router.get('/logout', helpers.loginRequired, (req, res, next) => {
  req.logout();
  handleResponse(res, 200, 'success');
});

router.get('/user', helpers.loginRequired, (req, res, next)  => {
  handleResponse(res, 200, 'success');
});

module.exports = router;
