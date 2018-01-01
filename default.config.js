'use strict';

const path = require('path');

module.exports = {
  name : 'My Shop',
  mongodbURI : process.env.MONGODB_URI,
  sessionSecret : process.env.SESSION_SECRET,
  env : process.env.NODE_ENV, // "development", "production" or "test"
  adminDev : false,
  adminLogin : process.env.ECHOPPE_ADMIN_LOGIN,
  adminHash : process.env.ECHOPPE_ADMIN_HASH,
  contentDir : path.join(__dirname, 'content'), // app-generated content will go here
  url : 'http://localhost:3000/',
  currency : {
    code : 'USD',
    symbol : '$',
  },
  thumbnailsFormats : [
    { name : `small_square`, transform : { resize : [200, 200] } }
  ],
  orderSteps : ['order:shipping', 'order:payment'],
  testConfig : {},

};
