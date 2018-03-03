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
    ...middlewareManager.getMiddlewares('products', 'get', 'start'),
    ...middlewareManager.getMiddlewares('products', 'get', 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      res.locals.products = await models.product.list();
      next();
    }),
    ...middlewareManager.getMiddlewares('products', 'get', 'afterLogic'),
    sendJson('products'),
    ...middlewareManager.getMiddlewares('products', 'get', 'end'),
  );


  router.post('/products',
  ...middlewareManager.getMiddlewares('products', 'post', 'start'),
    isAdmin,
    ...middlewareManager.getMiddlewares('products', 'post', 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      res.locals.product = await models.product.add({
        name : req.body.name,
        stock : req.body.stock,
        price : req.body.price,
        description : req.body.description,
      });
      next();
    }),
    ...middlewareManager.getMiddlewares('products', 'post', 'afterLogic'),
    sendJson('product'),
    ...middlewareManager.getMiddlewares('products', 'post', 'end'),
    end,
  );


  router.get('/products/:product',
    ...middlewareManager.getMiddlewares('product', 'get', 'start'),
    csrf,
    ...middlewareManager.getMiddlewares('product', 'get', 'beforeLogic'),
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
    ...middlewareManager.getMiddlewares('product', 'get', 'afterLogic'),
    ...middlewareManager.getMiddlewares('product', 'get', 'end'),
  );


  router.put('/products/:product',
  ...middlewareManager.getMiddlewares('product', `put`, 'start'),
    isAdmin,
    ...middlewareManager.getMiddlewares('product', `put`, 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      res.locals.product = await models.product.modify({
        ...req.body,
        _id : req.params.product,
      });

      next();
    }),
    ...middlewareManager.getMiddlewares('product', `put`, 'afterLogic'),
    sendJson('product'),
    ...middlewareManager.getMiddlewares('product', `put`, 'end'),
    end,
  );

  router.post('/products/:product/uploads',
  ...middlewareManager.getMiddlewares('product_uploads', 'post', 'start'),
    isAdmin,
    ...middlewareManager.getMiddlewares('product_uploads', 'post', 'beforeLogic'),
    upload.array('files'),
    safeHandle(async (req, res, next) => {
      res.locals.uploads = await models.upload.addBulk(req.files.map(file => ({
        name : file.originalname,
        filename : file.filename,
        description : ``,
        path : file.path,
        type : file.mimetype,
        product : req.params.product,
      })));
      next();
    }),
    ...middlewareManager.getMiddlewares('product_uploads', 'post', 'afterLogic'),
    sendJson('uploads'),
    ...middlewareManager.getMiddlewares('product_uploads', 'post', 'end'),
    end,
  );

  router.delete('/products/:product',
    ...middlewareManager.getMiddlewares('product', `delete`, 'start'),
    isAdmin,
    ...middlewareManager.getMiddlewares('product', `delete`, 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      await models.product.destroy(req.params.product);

      res.end();
    }),
    // ...middlewareManager.getMiddlewares('product' `delete`, 'afterLogic'),
    // ...middlewareManager.getMiddlewares('product' `delete`, 'end'),
  );

};
