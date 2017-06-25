'use strict';

const passport = require(`passport`);
const LocalStrategy = require(`passport-local`).Strategy;

// const init = require(`./passport`);
const db = require(`../db/db`);
const bcrypt = require(`bcryptjs`);

const comparePass =  (userPassword, databasePassword) => {
  return bcrypt.compareSync(userPassword, databasePassword);
}

const options = {
  usernameField: 'email',
};

module.exports = () => {

  passport.serializeUser((user, done) => {
    console.log(`Serializing user...`);
    done(null, user.uid);
  });

  passport.deserializeUser((uid, done) => {
    console.log(`Deserializing user...`);
    // return db.models.user.findOne({ uid })
    return db.models.user.fetchOne(uid)
    .then(user => {
      if (user) {
        done(null, user);
        return null;
      }
      done(`unknown user`, null);
      return null;
    })
    .catch(err => {
      console.log(`Error while deserializing user`);
      console.log(err);
      done(err, null);
      return null;
    })
  });

  passport.use(new LocalStrategy(options, (email, password, done) => {
    console.log(`Local strategy`);
    // return db.models.user.findOne({ email })
    return db.models.user.fetchByEmail(email)
    .then((user) => {
      if (!user || !user.active) return done(null, false);
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
