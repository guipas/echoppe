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
      // mongoose.Types.ObjectId(_id)
      currentCart = await models.cart.findOne({
        _id : req.session.cartId,
        state : { $lt : cartStatus.COMPLETED }
      }).populate('content.product');
      // log(`Cart found : `, currentCart)
      // log(`all carts : `, await models.cart.find());
    } catch (e) {
      log(`Cart not found !`);
      currentCart = null;
    }
  }

  req.shop.getCurrentCart = async () => {
    // log('getting current cart...')
    if (currentCart) {
      // log(`current cart`, currentCart);
      return currentCart;
    }

    // log('creating new cart...');
    currentCart = new models.cart();
    await currentCart.save();
    req.session.cartId = currentCart._id.toString();
    await new Promise((resolve, reject) => req.session.save(err => { return err ? reject() : resolve(err); }));

    return currentCart;
  }


  next();
});
