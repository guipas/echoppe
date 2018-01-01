'use strict';

const path = require('path');

module.exports = {
  name : 'My Shop',
  mongodbURI : process.env.MONGODB_URI,
  sessionSecret : process.env.SESSION_SECRET,
  debug : process.env.NODE_ENV === `development`,
  adminDev : false,
  adminLogin : null,
  adminHash : null,
  contentDir : path.join(__dirname, 'content'),
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
