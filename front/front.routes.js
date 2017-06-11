'use strict';

const express = require(`express`);
const router = express.Router();

const mediaHandlers = require(`./handlers/media.handlers`);
const productsHandlers = require(`./handlers/products.handlers`);
const productHandlers = require(`./handlers/product.handlers`);
const cartHandlers = require(`./handlers/cart.handlers`);
const orderHandlers = require(`./handlers/order.handlers`);
const homeHandlers = require(`./handlers/home.handlers`);
const safe = require(`../lib/safe_promise_handler`);
const pages = require(`../lib/pages`);

const front = config => {

  router.get(`/`, safe(homeHandlers.home));

  router.get(`/image/:name`, mediaHandlers.getImage);

  router.get(`/products`, productsHandlers.list);
  router.get(`/product/:product`, safe(productHandlers.show));

  router.post(`/cart/product/:product`, cartHandlers.addProduct);
  router.get(`/cart`, cartHandlers.list);

  router.all(`/order`, orderHandlers.order);

  pages(config).then(middleware => router.get(`/pages/:page`, middleware));

  return router;
}

module.exports = front;
