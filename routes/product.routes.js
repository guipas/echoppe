'use strict';

const path = require('path');
const multer = require(`multer`);
const isAdmin = require('../lib/isAdmin.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');
const middlewareManager = require('../lib/middlewareManager');
const csrf = require('../lib/csrf.middleware');
const sendJson = require('../lib/sendJson.middleware');
const end = require('../lib/end.middleware');


module.exports = router => {
  const upload = multer({ dest: path.join(config.contentDir, `uploads`) });

  router.get('/products',
    ...middlewareManager.getMiddlewares('products', true, `get`),
    safeHandle(async (req, res, next) => {
      res.locals.products = await models.product.list();
      next();
    }),
    ...middlewareManager.getMiddlewares('products:list', false, `get`),
    safeHandle(async (req, res) => {
      if (req.wantsJson) {
        res.json(res.locals.products).end();
        return;
      }

      res.end();
    }),
  );


  router.post('/products',
    isAdmin,
    ...middlewareManager.getMiddlewares('products', true, `post`),
    safeHandle(async (req, res, next) => {
      res.locals.product = await models.product.add({
        name : req.body.name,
        stock : req.body.stock,
        price : req.body.price,
        description : req.body.description,
      });
      next();
    }),
    ...middlewareManager.getMiddlewares('products', false, `post`),
    safeHandle(async (req, res) => {
      if (req.wantsJson) {
        return res.json(res.locals.product);
      }

      return res.end();
    }),
  );


  router.get('/products/:product',
    ...middlewareManager.getMiddlewares('product', true, `get`),
    csrf,
    safeHandle(async (req, res, next) => {
      const product = await models.product.fetch(req.params.product);
      if (!product) {
        return res.status(404).end();
      }

      if (req.wantsJson) {
        return res.json(product).end();
      }

      res.locals.product = product;
      next();
    }),
    ...middlewareManager.getMiddlewares('product', false, `get`),
  );


  router.put('/products/:product',
    isAdmin,
    ...middlewareManager.getMiddlewares('product', true, `put`),
    safeHandle(async (req, res, next) => {
      res.locals.product = await models.product.modify({
        ...req.body,
        _id : req.params.product,
      });

      next();
    }),
    ...middlewareManager.getMiddlewares('product', false, `put`),
    sendJson('product'),
    end,
  );

  router.post('/products/:product/uploads',
    isAdmin,
    ...middlewareManager.getMiddlewares('product:uploads', true, `post`),
    upload.array('files'),
    safeHandle(async (req, res) => {
      res.locals.uploads = await models.upload.addBulk(req.files.map(file => ({
        name : file.originalname,
        filename : file.filename,
        description : ``,
        path : file.path,
        type : file.mimetype,
        product : req.params.product,
      })));

      res.end();
    }),
    ...middlewareManager.getMiddlewares('product:uploads', false, `post`),
    sendJson('uploads'),
    end,
  );

  router.delete('/products/:product',
    isAdmin,
    ...middlewareManager.getMiddlewares('product', true, `delete`),
    safeHandle(async (req, res) => {
      await models.product.destroy(req.params.product);

      res.end();
    }),
    ...middlewareManager.getMiddlewares('product', false, `delete`),
  );

};
