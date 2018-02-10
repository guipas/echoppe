'use strict';

const mongoose = require('mongoose');
const moment = require('moment');
const status = require('./cart.status');
const productModel = require('./product.model');
const log = require('../debugLog').log;
const eventManager = require('../eventManager');


const schema = new mongoose.Schema({
  state : { type : Number, default : status.NEW },
  content : [{
    product : { type : mongoose.Schema.Types.ObjectId, ref : 'product' },
    quantity : Number,
    finalPrice : Number,
  }],
  currentStep : String,
  stepFulfillments : Object,
  placedOn : Date,
}, {
  toJSON : { virtuals : true },
  timestamps : true,
  id : true,
});

schema.statics.fetch = function fetch (cart) {
  const _id = cart._id || cart;
  return this.findOne(mongoose.Types.ObjectId(_id)).populate('content.product');
}

schema.statics.modify = function modify (cart) {
  return this.update({ _id : cart._id }, cart);
}

schema.statics.destroy = function destroy (cart) {
  const _id = cart._id || cart;
  return this.remove({ _id });
}

schema.statics.listOrders = function listOrders () {
  return this.find({ state : { $gte : status.COMPLETED } });
}

schema.statics.fetchOrder = function fetchOrder (order) {
  const _id = order._id || order;
  return this.findOne({ _id, state : { $gte : status.COMPLETED } }).populate('content.product');
}

schema.methods.addProduct = async function addProduct (product, quantity) {
  log('Adding product to cart...', product, quantity);
  if (isNaN(quantity)) { quantity = 1; }
  const productId = product._id || product;
  const prod = await productModel.fetch(productId);
  if (!prod) {
    throw new Error(`This product does not exists`);
  }
  const line = this.content.find(line => line.product._id.toString() === prod._id.toString());
  if (line) {
    console.log("product already in cart");
    line.quantity += quantity;
  }
  else {
    console.log('product not in cart yet');
    this.content.push({ product : prod, quantity })
  }

  await this.save();
};

schema.methods.removeProduct = async function removeProduct (product, quantity) {
  if (isNaN(quantity)) { quantity = 1; }
  const productId = product._id || product;
  const index = this.content.findIndex(line => line.productId === productId);
  if (index > -1) {
    if (quantity === null) {
      this.content.splice(index, 1);
    } else {
      this.content[index].quantity -= quantity;
      if (this.content[index].quantity <= 0) this.content.splice(index, 1);
    }
  }

  await this.save();
};

schema.methods.fulfillStep = async function fulfillStep (stepName, data) {
  await this.setStepData(stepName, data);
  this.stepFulfillments[stepName].state = 'complete';
  this.markModified('stepFulfillments');
  this.save();
};

schema.methods.setStepData = async function setStepData (stepName, data) {
  if (!data.handler) throw new Error('no handler name');
  if (!this.stepFulfillments) { this.stepFulfillments = {}; }
  this.stepFulfillments[stepName] = { state : 'new', ...data, handlerName : data.handler };
  this.markModified('stepFulfillments');
  return this.save();
};

schema.methods.clearCurrentStep = async function clearCurrentStep () {
  this.currentStep = null;
  return await this.save();
};

schema.methods.getStepHandlerData = async function getStepHandlerData (stepName, handlerName) {
  if (this.stepFulfillments[stepName] && this.stepFulfillments[stepName].handlerName === handlerName) {
    return this.stepFulfillments[stepName];
  }

  return {};
};

schema.methods.canOrder = async function canOrder () {
  return this.content.length > 0;
};

schema.methods.setCurrentStep = async function setCurrentStep (stepName) {
  this.currentStep = stepName;
  return await this.save();
};

schema.methods.setState = async function setState (state) {
  this.state = state;
  return await this.save();
};

schema.methods.checkQuantities = async function checkQuantities () {
  const quantityErrors = [];

  if (!this) return quantityErrors;

  this.content.forEach(line => {
    if (line.product.stock < line.quantity) {
      quantityErrors.push({ productId : line.product._id.toString(), available : line.product.stock });
    }
  });

  return quantityErrors;
};

schema.methods.complete = async function complete () {
  log('setting order as complete...');
  this.state = status.COMPLETED;
  this.placedOn = moment().toDate();
  await Promise.all(this.content.map(line => {
    line.finalPrice = line.product.price;

    return productModel.modify({
      _id : line.product._id,
      stock : line.product.stock - line.quantity,
    });
  }));
  this.markModified('content');
  await this.save();
  eventManager.broadcast('order:completed', { cart : this });
  // this.cart = null;
  // this.session.cartId = null;
  // await new Promise((res, rej) => this.session.save(err => {
  //   if (err) { return rej(err); }
  //   return res();
  // }));
  return;
};

schema.methods.getTotal = async function getTotal () {
  return this.content.reduce((total, line) => total + line.product.price * line.quantity, 0);
};

schema.methods.setProductQuantity = async function setProductQuantity (product, quantity) {
  const productId = product._id || product;
  console.log(this.content);
  const line = this.content.find(line => line.product.toString() === productId);

  line.quantity = quantity;
  this.markModified('content');
  return await this.save();
};

schema.methods.getEmail = async function getEmail () {
  if (this.cart && this.stepFulfillments && this.stepFulfillments['order:shipping'] && this.stepFulfillments['order:shipping'].address) {
    return this.stepFulfillments['order:shipping'].address.email;
  }
  return null;
};

const Cart = mongoose.model('cart', schema);

module.exports = Cart;
