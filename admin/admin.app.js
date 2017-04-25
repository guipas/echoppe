'use strict';

const express = require(`express`);
const path = require(`path`);
const admin = express();
const authHelpers = require(`../auth/helpers`);
const upload = require(`../lib/upload`);

const productHandlers = require(`./handlers/product.handlers`);
const productsHandlers = require(`./handlers/products.handlers`);
const mediaHandlers = require(`./handlers/media.handlers`);
const pluginsHandlers = require(`./handlers/plugins.handlers`);


admin.locals.config = require(`../config`);
admin.locals.linkTo = adminRoute => `${admin.locals.config.site.url}/${path.join(`admin`, adminRoute)}`;
admin.locals.linkToFront = () => `${admin.locals.config.site.url}`;



admin.set(`views`, path.join(__dirname, `views`));
admin.set(`view engine`, `ejs`);


admin.get(`/`, authHelpers.adminRequired, (req, res) => {
   res.status(200).json({ status: 'success' });
})

admin.get(`/products`, productsHandlers.list);

admin.get(`/product/create`, productHandlers.showCreate);
admin.post(`/product/create`, upload.array(`images`), productHandlers.create);

admin.get(`/images`, mediaHandlers.list);

admin.get(`/plugins`, pluginsHandlers.list):

module.exports = admin;
