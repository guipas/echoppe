'use strict';

const isAdmin = require('../lib/isAdmin.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const middlewareManager = require('../lib/middlewareManager');
const csrf = require('../lib/csrf.middleware');
const sendJson = require('../lib/sendJson.middleware');
const end = require('../lib/end.middleware');

module.exports = router => {
  router.get('/cart',
    ...middlewareManager.getMiddlewares('cart', 'get', 'start'),
    ...middlewareManager.getMiddlewares('cart', 'get', 'beforeLogic'),
    safeHandle(async (req, res) => {
      const cart = await req.shop.getCurrentCart();

      if (req.wantsJson) {
        res.json(cart);
        return;
      }

      const quantityErrors = await cart.checkQuantities();
      const quantityErrorsMap = quantityErrors.reduce((m, curr) => { m[curr.productId] = curr.available; return m }, {});

      res.locals.cart = cart;
      res.lcoals.quantityErrors = quantityErrors;
      res.locals.quantityErrorsMap = quantityErrorsMap;
    }),
    ...middlewareManager.getMiddlewares('cart', 'get', 'afterLogic'),
    csrf,
    ...middlewareManager.getMiddlewares('cart', 'get', 'end'),
  );


  router.post('/cart/products/:product',
    ...middlewareManager.getMiddlewares('cart_products', 'post', 'start'),
    ...middlewareManager.getMiddlewares('cart_products', 'post', 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      const cart = await req.shop.getCurrentCart();
      await cart.addProduct(req.params.product);

      console.log('cart after putin product :', cart);
      await cart.save();

      res.locals.cart = cart;
      next();
    }),
    ...middlewareManager.getMiddlewares('cart_products', 'post', 'afterLogic'),
    sendJson('cart'),
    ...middlewareManager.getMiddlewares('cart_products', 'post', 'end'),
    safeHandle(async (req, res) => {
      res.redirect('/cart');
    }),
  );

  router.put('/cart/products/:product',
    ...middlewareManager.getMiddlewares('cart_products', 'put', 'start'),
    ...middlewareManager.getMiddlewares('cart_products', 'put', 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      const cart = await req.shop.getCurrentCart();
      const quantity = parseInt(req.body.quantity, 10);
      await cart.setProductQuantity(req.params.product, quantity);

      res.locals.cart = cart;
      next();
    }),
    ...middlewareManager.getMiddlewares('cart_products', 'put', 'afterLogic'),
    sendJson('cart'),
    ...middlewareManager.getMiddlewares('cart_products', 'put', 'end'),
    safeHandle(async (req, res) => {
      res.redirect('/cart');
    }),
  );

  // router.get('/cart/delete',
  //   safeHandle(async (req, res) => {
  //     const cart = await req.shop.getCurrentCart();
  //     await cart.remove();

  //     if (req.wantsJson) {
  //       res.end();
  //     }

  //     res.redirect('/cart');
  //   }),
  // );

  router.put('/carts/:cart',
    ...middlewareManager.getMiddlewares('cart', 'put', 'start'),
    isAdmin,
    ...middlewareManager.getMiddlewares('cart', 'put', 'beforeLogic'),
    safeHandle(async (req, res, next) => {
      res.locals.cart = await models.cart.modify({ ...req.body, _id : req.params.cart });
      next();
    }),
    ...middlewareManager.getMiddlewares('cart', 'put', 'afterLogic'),
    sendJson('cart'),
    ...middlewareManager.getMiddlewares('cart', 'put', 'end'),
    end,
  );

}
