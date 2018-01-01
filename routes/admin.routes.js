'use strict';

const _ = require('lodash');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const isAdmin = require('../lib/isAdmin.auth.middleware');
const safeHandle = require(`../lib/safeHandle`);
const config = require('../lib/config');
const log = require('../lib/debugLog').log;
const saltRounds = 10;

module.exports = router => {
  router.get('/admin/login', safeHandle(async (req, res) => {
    const adminEnabled = config.adminHash && config.adminLogin;
    const isAdmin = req.session.isAdmin;

    if (adminEnabled) {
      return res.render('admin-login', {
        csrf : req.csrfToken(),
        adminEnabled,
        isAdmin,
      });
    }

    crypto.randomBytes(8, function(err, buffer) {
      const examplePassowrd = buffer.toString('hex');
      bcrypt.hash(examplePassowrd, saltRounds, function(err, exampleHash) {
        return res.render('admin-login', {
          csrf : req.csrfToken(),
          adminEnabled,
          isAdmin,
          examplePassowrd,
          exampleHash,
        });
      });
    });

  }));

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
