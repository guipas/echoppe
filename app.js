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
const defaultConfig = require('./default.config.js');
const db  = require('./lib/db');
const debugLog = require('./lib/debugLog');
const mainMiddleware = require('./lib/main.middleware');
const index = require('./routes/index');
const wantsJson = require('./lib/wantsJson.middleware');
const config = require('./lib/config');

const init = (customConfig = {}) => {
  // const config = { ...defaultConfig, ...customConfig };
  config.init(customConfig);
  const app = express();

  debugLog.init(config);

  db.init(config).then(() => {
    app.locals.linkTo = (...paths) => url.resolve(config.url, paths.join(`/`));
    app.locals.config = config;
    
    // view engine setup
    app.set('views', path.join(__dirname, 'lib/default-front'));
    app.set('view engine', 'ejs');
    app.set('view options', { _with : false });
    
    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    // app.use(express.static(path.join(__dirname, 'content', 'public')));
    app.use(session({
      store: new MongoStore({ url:config.mongodbURI }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }));
    app.use(csrf({ cookie: true }));
    app.use(wantsJson);
    
    app.use('/csrf', (req, res) => res.json({ csrf : req.csrfToken() }));
    app.use('/', mainMiddleware);
    app.use('/', index(config));
    
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });
    
    // error handler
    app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
    
      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  })
  .catch(err => { 
    debugLog.log('Failed to connect to mongodb !')
    debugLog.log(err);
    app.use((req, res) => {
      res.send('Failed to connect to database');
    })
  });

  return app;
}


module.exports = config => init(config);
