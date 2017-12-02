const express = require('express');
const multer = require(`multer`);
const path = require('path');
const isAdmin = require('../lib/isAdmin.auth.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');
const mediaManager = require('../lib/mediaManager');
const orderRoutes = require('./order.routes');

module.exports = () => {
  const router = express.Router();
  const upload = multer({ dest: path.join(config.contentDir, `uploads`) });

  router.post('/api/admin/login', (req, res) => {
    req.session.isAdmin = true;
    res.end();
  })

  router.get('/', safeHandle(async (req, res) => {
    const products = await models.product.list();
    res.render('index', { products, csrf : req.csrfToken() });
  }));

  router.get('/products', safeHandle(async function (req, res, next) {
    const products = await models.product.list();
    if (req.wantsJson) {
      res.json(products).end();
      return;
    }

    res.end();
  }));

  router.get('/products/:product', safeHandle(async (req, res, next) => {
    const product = await models.product.fetch(req.params.product);
    if (req.wantsJson) {
      res.json(product).end();
      return;
    }

    res.render('product', { product, csrf : req.csrfToken() });
  }));

  router.post('/products', isAdmin, safeHandle(async function (req, res) {
    const prod = await models.product.add({
      name : req.body.name,
      quantity : req.body.quantity,
      price : req.body.price,
      description : req.body.description,
    });

    res.end();
  }));

  router.put('/products/:product', isAdmin, safeHandle(async function (req, res) {
    const prod = await models.product.modify({
      ...req.body,
      _id : req.params.product,
    });

    res.end();
  }));

  router.put('/products/:product/uploads', isAdmin, upload.array('files'), safeHandle(async (req, res) => {
    await models.upload.addBulk(req.files.map(file => ({
      name : file.originalname,
      filename : file.filename,
      description : ``,
      path : file.path,
      type : file.mimetype,
      product : req.params.product,
    })));

    res.end();
  }));

  router.delete('/products/:product', isAdmin, safeHandle(async function (req, res) {
    const prod = await models.product.destroy(req.params.product);

    res.end();
  }));

  router.get('/cart', safeHandle(async (req, res) => {
    const cart = req.shop.cartManager.cart;

    if (req.wantsJson) {
      res.json(cart).end;
      return;
    }

    res.render('cart', { cart });
  }));

  router.post('/cart/products/:product', safeHandle(async (req, res) => {
    await req.shop.cartManager.addProduct(req.params.product);

    if (req.wantsJson) {
      res.end();
    }

    res.redirect('/cart');
  }));

  router.get('/cart/delete', safeHandle(async (req, res) => {
    await req.shop.cartManager.destroy();

    if (req.wantsJson) {
      res.end();
    }

    res.redirect('/cart');
  }));

  router.get('/uploads/:upload', safeHandle(async (req, res) => {
    const upload = await models.upload.fetch(req.params.upload);
    res.set('Content-Type', upload.type);
    res.sendFile(path.join(config.contentDir, 'uploads', upload.filename));
  }));

  router.get('/uploads/:upload/thumbnail', safeHandle(async (req, res) => {
    const upload        = await models.upload.fetch(req.params.upload);
    const thumbnailPath = await mediaManager.getThumbnail(upload.filename, req.query.format);
    res.set('Content-Type', upload.type);
    res.sendFile(thumbnailPath);
  }));

  router.delete('/uploads/:upload', safeHandle(async (req, res) => {
    await models.upload.destroy(req.params.upload);
    res.end();
  }));

  orderRoutes(router);


  return router;
};
