'use strict';

const express = require(`express`);
const router = express.Router();
const db = require(`../db/db`);

const mediaHandlers = require(`./handlers/media.handlers`);
const productsHandlers = require(`./handlers/products.handlers`);
const productHandlers = require(`./handlers/product.handlers`);
const cartHandlers = require(`./handlers/cart.handlers`);


router.get('/', (req, res) => { res.render(`index`) });

router.get(`/image/:name`, mediaHandlers.getImage);

router.get(`/products`, productsHandlers.list);

router.post(`/cart/product/:product`, cartHandlers.addProduct);
router.get(`/cart`, cartHandlers.list);


module.exports = router;
