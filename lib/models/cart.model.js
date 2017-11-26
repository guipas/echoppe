'use strict';

const mongoist = require('mongoist');
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id : String,
  state : String,
  content : [{ product : { type : mongoose.Schema.Types.ObjectId, ref : 'product'}, quantity : Number }],
  currentStep : String,
  stepFulfillments : Object,
});

const Cart = mongoose.model('cart', schema);

module.exports = {
  async createEmpty () {
    const cart = new Cart({
      id : uuidv4(),
      content : [],
      state : 'new',
    });
    return await cart.save();
  },
  async fetch(id) {
    const cart = await Cart.findOne({ id }).populate('content.product');
    // if (cart) {
    //   Reflect.deleteProperty(cart, `_id`);
    // }
    return cart;
  },
  async modify (cart) {
    return Cart.update({ id : cart.id }, cart);
    // return cart.save();
  },
  async destroy (cart) {
    const cartId = (typeof cart === `string`) ? cart : cart.id;
    // return await db.carts.remove({ id : cartId });
    return await Cart.remove({ id : cartId });
  }
};