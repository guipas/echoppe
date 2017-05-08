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
const stepsHandlers = require(`./handlers/steps.handlers`);
const ordersHandlers = require(`./handlers/orders.handlers`);


admin.locals.config = require(`../config`);
admin.locals.linkTo = (...adminRoute) => `${admin.locals.config.site.url}/${path.join(`admin`, ...adminRoute)}`;
admin.locals.linkToFront = (...routes) => `${admin.locals.config.site.url}${routes ? path.join(`/`, ...routes) : ``}`;



admin.set(`views`, path.join(__dirname, `views`));
admin.set(`view engine`, `ejs`);

admin.use(authHelpers.adminRequired);

admin.get(`/`, (req, res) => {
   res.status(200).json({ status: 'success' });
})

admin.get(`/products`, productsHandlers.list);

admin.get(`/product/create`, productHandlers.showCreate);
admin.get(`/product/:product`, productHandlers.details);
admin.post(`/product/create`, upload.array(`images`), productHandlers.create);
admin.post(`/product/:product`, upload.array(`images`), productHandlers.modify);

admin.get(`/images`, mediaHandlers.list);

admin.get(`/plugins`, pluginsHandlers.list);
admin.post(`/plugins/:plugin`, pluginsHandlers.triggerActivation);

admin.get(`/steps`, stepsHandlers.list);
admin.post(`/steps/:step`, stepsHandlers.triggerActivation);

admin.get(`/orders`, ordersHandlers.list);

module.exports = admin;
