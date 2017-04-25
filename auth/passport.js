'use strict';

const passport = require(`passport`);
const db = require(`../db/db`);

module.exports = () => {

  passport.serializeUser((user, done) => {
    done(null, user.uid);
    return null;
  });

  passport.deserializeUser((uid, done) => {
    db.collections.user.findOne({ uid })
    .then(user => {
      if (user) {
        done(null, user)
        return null;
      }
      done(`unknown user`, null);
      return null;
    })
    .catch(err => {
      done(err, null);
      return null;
    });
  });
};
