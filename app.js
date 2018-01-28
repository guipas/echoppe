require('dotenv').config();

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const csrf = require('csurf');
const url = require('url');
const db  = require('./lib/db');
const debugLog = require('./lib/debugLog');
const mainMiddleware = require('./lib/main.middleware');
const routes = require('./routes/index');
const wantsJson = require('./lib/wantsJson.middleware');
const config = require('./lib/config');
const isAdmin = require('./lib/isAdmin.middleware');
const mailer = require('./lib/mailer');
const linkTo = require('./lib/linkTo');
const eventManager = require('./lib/eventManager');

const init = (customConfig = {}) => {
  config.init(customConfig);
  const app = express();

  debugLog.init(config);
  const log = debugLog.log;
  log('Initializing echopppe...');

  mailer.init(config);
  eventManager.init();

  let initialized = null;
  app.initialized = new Promise((resolve, reject) => {
    initialized = resolve;
  })

  db.init(config).then(connection => {
    log('connected successfuly to database');
    app.locals.linkTo = linkTo;
    app.locals.config = config;
    app.locals.connection = connection;

    // view engine setup
    app.set('views', path.join(__dirname, 'lib/default-front'));
    app.set('view engine', 'ejs');
    app.set('view options', { _with : false });

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    if (config.requestLog) {
      app.use(logger(config.requestLog));
    }
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use('/public', express.static(config.publicDir));
    app.use(session({
      store : config.sessionUseStore ? new MongoStore({ url:config.mongodbURI }) : null,
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie : {
        httpOnly : true,
      },
    }));
    app.use(csrf());
    app.use(wantsJson);

    app.use('/', mainMiddleware);
    app.use('/', routes(config));

    if (config.adminDev) {
      log(`Using dev version of admin`);
      app.use('/admin', isAdmin, require('./admin/build/dev-app'));
    } else {
      log('Using bundled version of admin')
      app.get('/admin', isAdmin, (req, res) => res.render(path.join(__dirname, 'admin', 'dist', 'index.ejs'), { config }));
      app.use('/admin', isAdmin, express.static(path.join(__dirname, 'admin', 'dist')));
    }

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
      log('ERROR : ', err);
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = config.env === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    log('Up and runnnig : ', config.url);
    initialized(app);
  })
  .catch(err => {
    debugLog.log('Failed to connect to mongodb !')
    debugLog.log(err);
    app.use((req, res) => {
      res.send('Failed to connect to database');
    });

    return Promise.reject(app);
  });

  return app;
}


module.exports = config => init(config);
