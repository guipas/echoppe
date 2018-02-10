'use strict'

const safeHandle = require('./safeHandle');
const models = require('./models');
const cartStatus = require('./models/cart.status');
const log = require('./debugLog').log;

module.exports = safeHandle(async (req, res, next) => {

  let currentCart = null;

  if (req.session.cartId) {
    log(`Cart id in session : ${req.session.cartId}`);
    try {
      currentCart = await models.cart.findOne({
        _id : req.session.cartId,
        state : { $lt : cartStatus.COMPLETED }
      }).populate('content.product');

    } catch (e) {
      currentCart = null;
    }
  }

  req.shop.getCurrentCart = async () => {
    if (currentCart) {
      return currentCart;
    }

    currentCart = new models.cart();
    await currentCart.save();
    req.session.cartId = currentCart._id.toString();
    await new Promise((resolve, reject) => req.session.save(err => { return err ? reject() : resolve(err); }));

    return currentCart;
  }


  next();
});
