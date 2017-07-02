"use strict";
require(`dotenv`).config();

const favicon = require(`serve-favicon`);
const express = require(`express`);
const path = require(`path`);
const logger = require(`morgan`);
const cookieParser = require(`cookie-parser`);
const bodyParser = require(`body-parser`);
const config = require(`./config`);
const session = require(`express-session`);
const passport = require(`passport`);
const initLocalPassport = require('./auth/local');
const csrf = require('csurf');
const wantsJson = require(`./lib/wantsJson`);
const SequelizeSessionStore = require(`connect-session-sequelize`)(session.Store);
const sequelize = require(`./db/sequelize`);
const db = require(`./db/db`);
const pluginManager = require(`./lib/plugin_manager`);
const echoppeMiddleware = require(`./lib/echoppe.middleware`);
const firstTime = require(`./lib/first_time`);
const firstTimeMiddleware = require(`./lib/first_time.middleware`);
const seed = require(`./lib/seed`);

const sequelizeSessionStore = new SequelizeSessionStore({
  db: sequelize
})
sequelizeSessionStore.sync();

const app = express();

// set locals :
app.locals.config = config;
// app.locals.linkTo = (...routes) => `${config.site.url}${path.join(`/`, ...routes)}`;
// app.locals.themePublicUrl = (...routes) =>  app.locals.linkTo(`themes`, config.theme, `public`, ...routes);

// view engine setup
app.set(`views`, [
  path.join(__dirname, `content`, `themes`, config.theme),
]);
app.set(`view engine`, `ejs`);

app.use(wantsJson);
app.use(`/public`, express.static(path.join(__dirname, 'public')));
app.use(`/themes/${config.theme}/public`, express.static(path.join(__dirname, `content`, `themes`, config.theme, `public`)));


// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser(config.secret));
app.use(
  session({
    secret: config.secret,
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: app.get(`env`) === `production` },
    // proxy: true // if you do SSL outside of node.
  })
);


if (config.csrf) app.use(csrf());


app.use(passport.initialize());
app.use(passport.session());
initLocalPassport();

// app.use(cartMiddleware);
app.use(echoppeMiddleware);
// app.use(firstTimeMiddleware);

app.use(`/admin`, firstTimeMiddleware, require(`./admin/admin.app`));
app.use(`/auth`, firstTimeMiddleware, require(`./auth/routes`));
app.use(`/`, require(`./front/front.routes`)(config));

// catch 404 and forward to error handler
const notFoundHandler = (req, res, next) => {
  const err = new Error(`Not Found`);
  err.status = 404;
  next(err);
};

// error handler
const errorHandler = (err, req, res, next) => {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get(`env`) === `development` ? err : {};

  if (err.originalError) { console.log(err.originalError) }
  console.log(err);

  // render the error page
  res.status(err.status || 500);

  echoppeMiddleware(req, res, () => {
    if (req.wantsJson) {
      return res.json({ message : res.locals.message, error : res.locals.error })
    }

    return res.render(`error`);

  })

};

app.init = () => {
  // return db.sequelize.sync({ force : true })
  return db.sequelize.sync()
  .then(firstTime.launching)
  .then(isFirstTime => {
    if (isFirstTime) {
      console.log(`Launching app for the first time, seeding DB...`);
      return seed();
    }
    return null;
  })
  .then(() => {
    return pluginManager.init(db, app);
  })
  .then(() => {
    app.use(notFoundHandler);
    app.use(errorHandler);
  })
}

module.exports = app;
