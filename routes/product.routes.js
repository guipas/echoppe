'use strict';

const path = require('path');
const multer = require(`multer`);
const isAdmin = require('../lib/isAdmin.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');


module.exports = router => {
  const upload = multer({ dest: path.join(config.contentDir, `uploads`) });

  router.get('/products', safeHandle(async (req, res) => {
    const products = await models.product.list();
    if (req.wantsJson) {
      res.json(products).end();
      return;
    }

    res.end();
  }));

  router.get('/products/:product', safeHandle(async (req, res) => {
    const product = await models.product.fetch(req.params.product);
    if (!product) {
      return res.status(404).end();
    }

    if (req.wantsJson) {
      return res.json(product).end();
    }

    return res.render('product', { product, csrf : req.csrfToken() });
  }));

  router.post('/products', isAdmin, safeHandle(async (req, res) => {
    const product = await models.product.add({
      name : req.body.name,
      stock : req.body.stock,
      price : req.body.price,
      description : req.body.description,
    });

    if (req.wantsJson) {
      return res.json(product);
    }

    return res.end();
  }));

  router.put('/products/:product', isAdmin, safeHandle(async (req, res) => {
    await models.product.modify({
      ...req.body,
      _id : req.params.product,
    });

    res.end();
  }));

  router.post('/products/:product/uploads', isAdmin, upload.array('files'), safeHandle(async (req, res) => {
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

  router.delete('/products/:product', isAdmin, safeHandle(async (req, res) => {
    await models.product.destroy(req.params.product);

    res.end();
  }));
}
