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


router.get(`/`, safe(homeHandlers.home));

router.get(`/image/:name`, mediaHandlers.getImage);

router.get(`/products`, productsHandlers.list);

router.post(`/cart/product/:product`, cartHandlers.addProduct);
router.get(`/cart`, cartHandlers.list);

router.all(`/order`, orderHandlers.order);


module.exports = router;
