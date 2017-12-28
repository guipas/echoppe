const express = require('express')
const app = express()
const path = require('path');

// app.get('/', function (req, res) {
//   res.render(path.join(__dirname, './dist/index.ejs'), {
//     path : path.normalize(app.path(), '/'),
//   });
// });

// app.use('/', express.static(path.join(__dirname, 'dist')));

app.use('/', require('./build/dev-app.js'));

module.exports = app;