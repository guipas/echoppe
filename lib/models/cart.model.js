'use strict';

const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
const status = require('./cart.status');

const schema = new mongoose.Schema({
  state : Number,
  content : [{
    product : { type : mongoose.Schema.Types.ObjectId, ref : 'product' },
    quantity : Number,
    finalPrice : Number,
  }],
  currentStep : String,
  stepFulfillments : Object,
  placedOn : Date,
});

const Cart = mongoose.model('cart', schema);

module.exports = {
  orders : {
    async list () {
      const orders = await Cart.find({ state : { $gte : status.COMPLETED } });
      return orders;
    },
    async fetch (_id) {
      return await Cart.findOne({ _id, state : { $gte : status.COMPLETED } }).populate('content.product');
    }
  },
  async createEmpty () {
    const cart = new Cart({
      content : [],
      state : status.NEW,
    });
    return await cart.save();
  },
  async fetch (_id) {
    const cart = await Cart.findOne(mongoose.Types.ObjectId(_id)).populate('content.product');
    // if (cart) {
    //   Reflect.deleteProperty(cart, `_id`);
    // }
    return cart;
  },
  async modify (cart) {
    return Cart.update({ _id : cart._id }, cart);
  },
  async destroy (cart) {
    const cartId = (typeof cart === `string`) ? cart : cart._id;
    // return await db.carts.remove({ id : cartId });
    return await Cart.remove({ _id : cartId });
  }
};