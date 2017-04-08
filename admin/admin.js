'use strict';

const express = require(`express`);
const path = require(`path`);
const admin = express();
const authHelpers = require(`../auth/helpers`);

admin.set(`views`, path.join(__dirname, `views`));
admin.set(`view engine`, `ejs`);


admin.get(`/`, authHelpers.adminRequired, (req, res) => {
   res.status(200).json({status: 'success'});
})

admin.get(`/products/create`, (req, res) => {
  res.render(`index`);
})

module.exports = admin;
