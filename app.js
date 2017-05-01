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
const pluginManager = require(`./lib/plugins`);
const cartMiddleware = require(`./lib/cart.middleware`);
const echoppeMiddleware = require(`./lib/echoppe.middleware`);

const sequelizeSessionStore = new SequelizeSessionStore({
  db: sequelize
})
sequelizeSessionStore.sync();

const app = express();

// set locals :
app.locals.config = config;
app.locals.linkTo = routeName => `${config.site.url}${path.join(`/`, routeName)}`;

// view engine setup
app.set(`views`, [
  path.join(__dirname, `content`, `themes`, config.theme),
]);
app.set(`view engine`, `ejs`);

app.use(wantsJson);
// app.use(upload);
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

app.use(cartMiddleware);
app.use(echoppeMiddleware);

app.use(`/admin`, require(`./admin/admin.app`));
app.use(`/auth`, require(`./auth/routes`));
app.use(`/`, require(`./front/front.routes`));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error(`Not Found`);
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get(`env`) === `development` ? err : {};


  console.log(err.message);

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.send(`error`);
});

app.init = () => {
  // return db.sequelize.sync({ force : true })
  return db.sequelize.sync()
  .then(() => {
    pluginManager.init(db);
  })
}

module.exports = app;
