'use strict';

const passport = require(`passport`);
const db = require(`../db`);

module.exports = () => {

  passport.serializeUser((user, done) => {
    done(null, user.uid);
  });

  passport.deserializeUser((uid, done) => {
    db.collections.user.findOne({ uid })
    .then(user => {
      if (user) return done(null, user)
      return done(`unknown user`, null);
    })
    .catch(err => done(err, null));
  });
};
