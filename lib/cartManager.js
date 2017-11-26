'use strict';

const _ = require('lodash');
// const models = require('./models');
const log = require('./debugLog').log;

const models = {
  carts : require('./models/cart.model'),
  products : require('./models/product.model'),
};

module.exports = {
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
      const cart = await models.carts.fetch(session.cartId);
      log('Cart loaded : ', cart);
      if (cart) { this.cart = cart; }
    }
    return;
  },
  async _create () {
    log('Creating new cart...');
    const cart = await models.carts.createEmpty();
    if (cart) {
      log('New cart : ', cart);
      this.cart = cart;
      this.session.cartId = cart.id;
    } else throw new Error('Unable to create cart');
  },
  async _save () {
    log('Saving cart...', this.cart);
    // return await models.carts.modify(this.cart);
    return this.cart.save();
  },
  async addProduct(product, quantity = 1) {
    log('Adding product to cart...', product, quantity);
    if (!this.cart) { await this._create() }
    const productId = (typeof product === `string`) ? product : product.id;
    const prod = await models.products.fetch(productId);
    const line = this.cart.content.find(line => line.product === prod.id);
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
    const productId = (typeof product === `string`) ? product : product.id;
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
    await models.carts.destroy(this.cart.id);
    this.session.cartId = null;
    this.cart = null;
  },
  async fulfillStep(stepName, data) {
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
  async getStepHandlerData(stepName, handlerName) {
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
  async complete () {
    this.cart.state = `ordered`;
    await this.cart.save();
    this.cart = null;
    this.session.cartId = null;
    return await new Promise((resolve, reject) => this.session.save(err => { err ? reject(err) : resolve() }));
  },
  async getTotal () {
    return this.cart.content.reduce((total, line) => total + line.product.price * line.quantity, 0);
  }
}