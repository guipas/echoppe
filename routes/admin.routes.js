'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const safeHandle = require(`../lib/safeHandle`);
const config = require('../lib/config');
const saltRounds = 10;
const middlewareManager = require('../lib/middlewareManager');

module.exports = router => {
  router.get('/admin/login',
    ...middlewareManager.getMiddlewares('admin_login', 'get', 'start'),
    ...middlewareManager.getMiddlewares('admin_login', 'get', 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      const adminEnabled = config.adminHash && config.adminLogin;
      const isAdmin = req.session.isAdmin;

      res.locals.csrf = req.csrfToken();
      res.locals.adminEnabled = adminEnabled;
      res.locals.isAdmin = isAdmin;

      if (adminEnabled) {
        return next();
      }

      crypto.randomBytes(8, (err, buffer) => {
        const examplePassword = buffer.toString('hex');
        bcrypt.hash(examplePassword, saltRounds, (err, exampleHash) => {
          res.locals.exampleHash = exampleHash;
          res.locals.examplePassword = examplePassword;
          next();
        });
      });

    }),
    ...middlewareManager.getMiddlewares('admin_login', 'get', 'afterLogic'),
    ...middlewareManager.getMiddlewares('admin_login', 'get', 'end'),
  );

  router.post('/admin/login', safeHandle(async (req, res) => {
    if (config.adminHash && config.adminLogin) {
      const userMatch = req.body.user === config.adminLogin;
      const passwordMatch = await bcrypt.compare(req.body.password, config.adminHash);

      if (userMatch && passwordMatch) {
        req.session.isAdmin = true;
      } else {
        return res.redirect('.');
      }
    } else {
      return res.redirect('.');
    }

    if (req.wantsJson) {
      return res.end();
    }

    return res.redirect('.');
  }));

  router.post('/admin/logout', safeHandle(async (req, res) => {
    if (req.session.isAdmin) {
      console.log('IS ADMIN')
      req.session.isAdmin = false;
      return req.session.save(() => {
        console.log('SESSION SAVED');
        if (req.wantsJson) {
          return res.end();
        }

        return res.redirect(config.url)
      });
    }
    console.log('IS NOT ADMIN')

    if (req.wantsJson) {
      return res.end();
    }

    return res.redirect(config.url)
  }));
}
