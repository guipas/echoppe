'use strict';

const passport = require(`passport`);
const LocalStrategy = require(`passport-local`).Strategy;

// const init = require(`./passport`);
const db = require(`../db`);
const bcrypt = require(`bcryptjs`);

const comparePass =  (userPassword, databasePassword) => {
  return bcrypt.compareSync(userPassword, databasePassword);
}

const options = {
  usernameField: 'email',
};

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

  passport.use(new LocalStrategy(options, (email, password, done) => {
    return db.models.user.findOne({ email })
    .then((user) => {
      if (!user) return done(null, false);
      if (!comparePass(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    })
    .catch(err => {
      console.log(`Error local strategy`);
      console.log(err);
      done(err)
    });
  }));

}
