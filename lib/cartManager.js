'use strict';

const _ = require('lodash');
const moment = require('moment')
const models = require('./models');
const log = require('./debugLog').log;
const status = require('./models/cart.status');
const eventManager = require('./eventManager');

module.exports = () => ({
  cart : null,
  session : null,
  async init (session) {
    log('Init cart manager...')
    log('session.cartId : ', session.cartId);
    if (session) {
      this.session = session;
    }
    if (session.cartId) {
      log('Loading cart...');
      try {
        const cart = await models.cart.fetch(session.cartId);
        if (cart) { this.cart = cart; }
      } catch (err) {
        log(err);
        await this._create();
      }
      // log('Cart loaded : ', cart);
    }
    return;
  },
  async _create () {
    log('Creating new cart...');
    const cart = await models.cart.createEmpty();
    if (cart) {
      log('New cart : ', cart);
      this.cart = cart;
      this.session.cartId = cart._id;
    } else throw new Error('Unable to create cart');
  },
  async _save () {
    log('Saving cart...', this.cart);
    // return await models.carts.modify(this.cart);
    return this.cart.save();
  },
  async addProduct (product, quantity = 1) {
    log('Adding product to cart...', product, quantity);
    if (!this.cart) { await this._create() }
    const productId = (typeof product === `string`) ? product : product._id;
    const prod = await models.product.fetch(productId);
    if (!prod) {
      throw new Error(`This product does not exists`);
    }
    const line = this.cart.content.find(line => line.product._id.toString() === prod._id.toString());
    if (line) {
      console.log("product already in cart");
      line.quantity += quantity;
    }
    else {
      console.log('product not in cart yet');
      this.cart.content.push({ product : prod, quantity })
    }

    await this._save();
  },
  async removeProduct (product, quantity = null) {
    const productId = (typeof product === `string`) ? product : product._id;
    const index = this.cart.content.findIndex(line => line.productId === productId);
    if (index > -1) {
      if (quantity === null) {
        this.cart.content.splice(index, 1);
      } else {
        this.cart.content[index].quantity -= quantity;
        if (this.cart.content[index].quantity <= 0) this.cart.content.splice(index, 1);
      }
    }

    await this._save();
  },
  async destroy () {
    await models.cart.destroy(this.cart._id);
    this.session.cartId = null;
    this.cart = null;
  },
  async fulfillStep (stepName, data) {
    await this.setStepData(stepName, data);
    this.cart.stepFulfillments[stepName].state = 'complete';
    this.cart.markModified('stepFulfillments');
    this.cart.save();
  },
  async setStepData (stepName, data) {
    if (!data.handler) throw new Error('no handler name');
    if (!this.cart.stepFulfillments) { this.cart.stepFulfillments = {}; }
    this.cart.stepFulfillments[stepName] = { state : 'new', ...data, handlerName : data.handler };
    this.cart.markModified('stepFulfillments');
    return this.cart.save();
  },
  async clearCurrentStep () {
    this.cart.currentStep = null;
    return await this.cart.save();
  },
  async getStepHandlerData (stepName, handlerName) {
    if (this.cart.stepFulfillments[stepName] && this.cart.stepFulfillments[stepName].handlerName === handlerName) {
      return this.cart.stepFulfillments[stepName];
    }

    return {};
  },
  async canOrder () {
    return this.cart && this.cart.content.length > 0;
  },
  async setCurrentStep (stepName) {
    this.cart.currentStep = stepName;
    return await this.cart.save();
  },
  async setState (state) {
    this.cart.state = state;
    return await this.cart.save();
  },
  async checkQuantities () {
    const quantityErrors = [];

    if (!this.cart) return quantityErrors;

    this.cart.content.forEach(line => {
      if (line.product.stock < line.quantity) {
        quantityErrors.push({ productId : line.product._id.toString(), available : line.product.stock });
      }
    });

    return quantityErrors;
  },
  async complete () {
    log('setting order as complete...');
    this.cart.state = status.COMPLETED;
    this.cart.placedOn = moment().toDate();
    await Promise.all(this.cart.content.map(line => {
      line.finalPrice = line.product.price;

      return models.product.modify({
        _id : line.product._id,
        stock : line.product.stock - line.quantity,
      });
    }));
    this.cart.markModified('content');
    await this.cart.save();
    eventManager.emit('order:completed', { cartManager : this, cart : this.cart });
    this.cart = null;
    this.session.cartId = null;
    await new Promise((res, rej) => this.session.save(err => {
      if (err) { return rej(err); }
      return res();
    }));
    return;
  },
  async getTotal () {
    return this.cart.content.reduce((total, line) => total + line.product.price * line.quantity, 0);
  },
  async setProductQuantity (product, quantity) {
    const productId = product._id || product;
    console.log(this.cart.content);
    const line = this.cart.content.find(line => line.product._id.toString() === productId);

    line.quantity = quantity;
    this.cart.markModified('content');
    return await this.cart.save();
  },
  async getEmail () {
    if (this.cart && this.cart.stepFulfillments && this.cart.stepFulfillments['order:shipping'] && this.cart.stepFulfillments['order:shipping'].address) {
      return this.cart.stepFulfillments['order:shipping'].address.email;
    }
    return null;
  }
});
