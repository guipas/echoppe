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

const app = express();

// view engine setup
app.set(`views`, [
  path.join(__dirname, `content`, `themes`, config.theme),
  // path.join(__dirname, `admin`, `views`),
]);
app.set(`view engine`, `ejs`);


// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
initLocalPassport();

app.get(`/`, (req, res) => {
  res.send(`Hello World!`);
});


app.use(`/admin`, require(`./admin/admin`));
app.use(`/auth`, require(`./auth/routes`));

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

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.send(`error`);
});

// app.listen(3200, () => {
//   console.log(`Example app listening on port 3200!`);
// });

module.exports = app;
