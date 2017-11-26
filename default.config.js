'use strict';

const path = require('path');

module.exports = {
  name : 'My Shop',
  mongodbURI : process.env.MONGODB_URI,
  debug : process.env.NODE_ENV === `development`,
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
