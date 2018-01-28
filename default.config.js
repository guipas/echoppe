'use strict';

const path = require('path');

module.exports = {
  name : 'My Shop',
  mongodbURI : process.env.MONGODB_URI,
  sessionSecret : process.env.SESSION_SECRET,
  sessionUseStore : true,
  env : process.env.NODE_ENV, // "development", "production" or "test"
  debugLog : process.env.NODE_ENV === "development",
  requestLog : process.env.NODE_ENV === "development" ? 'dev' : null,
  emails : null,
  adminDev : false,
  adminLogin : process.env.ECHOPPE_ADMIN_LOGIN,
  adminHash : process.env.ECHOPPE_ADMIN_HASH,
  contentDir : path.join(__dirname, 'content'), // app-generated content will go here
  publicDir : path.join(__dirname, 'public'),
  url : 'http://localhost:3000/',
  currency : {
    code : 'USD',
    symbol : '$',
  },
  thumbnailsFormats : [
    { name : `small_square`, transform : { resize : [200, 200] } }
  ],
  orderSteps : ['order:shipping', 'order:payment'],
};
