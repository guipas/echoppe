'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);
const productModel = require(`./product.model`);
const priceModel = require(`./price.model`);
const cartProductModel = require(`./cart_product.model`);
const stepFulfillmentModel = require(`./step_fulfillment.model`);
const stepModel = require(`./step.model`);
const pluginManager = require(`../../lib/plugins`);

const CART_NEW = 0;
const CART_PROCESSING = 5;// all steps fulfilled, order accepted but waiting for external validation
const CART_ORDERED = 10;// order accepted (payment validated...), we can send the products
const CART_COMPLETED = 15;// product sent


const cartModel = sequelize.define(`cart`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    status : {
      type: Sequelize.INTEGER,
      defaultValue : CART_NEW,
    }

  }, {
    freezeTableName: true,
    underscored: true,
    classMethods : {
      fetchOne (uid) {
        console.log(`fetching cart...`);
        console.log(uid);
        return this.findOne({
          where : { uid },
          include: [
              { model: productModel, as: `products`, through : cartProductModel, include : [{ model : priceModel, as : `prices` }] },
              { model: stepFulfillmentModel, as: `stepFulfillments`, include : [{ model : stepModel, as: `step` }] },
            ],
        })
        .then(cart => cart.get({ plain : true }))
      },
      _addProductOrUpQuantity (cartUid, productUid) {
        return cartProductModel.findOne({
          where : { 'cart_uid' : cartUid, 'product_uid' : productUid }
        })
        .then(cartProduct => {
          if (!cartProduct) {
            console.log(`product no in cart yet, adding it...`);
            return this.findOne({ where : { uid : cartUid } })
            .then(cart => {
              if (!cart) return Promise.reject(`cart does not exists`);
              return productModel.findOne({ where : { uid : productUid } })
              .then(product => {
                cart.addProduct(product);
              })
            })
          }
          // just inrementing quantities...
          return cartProduct.increment(`quantity`);
        })
      },
      putProduct (cartUid, productUid) {
        let product = null;

        console.log(`finding product before adding it to cart...`);
        console.log(productUid);
        return productModel.findOne({ where : { uid : productUid } })
        .then(prod => {
          if (!prod) return Promise.reject(`product not found`);
          product = prod;
          return this.findOne({ where : { uid : cartUid } });
        })
        .then(cart => {
          if (!cart) {
            console.log(`no cart, creating...`);
            return this.create().then(cart => cart.addProduct(product).then(() => cart));
          }
          console.log(`existing cart, adding to cart`);
          // return cart.addProduct(product)
          return this._addProductOrUpQuantity(cart.uid, product.uid)
          .then(ret => {
            console.log(`product added`);
            console.log(ret);
          })
          .then(() => cart);
        })
        .then(cart => this.fetchOne({ where : { uid : cart.uid } }))
      },
      removeProduct (cartUid, productUid) {
        return cartProductModel.destroy({
          where : {
            'product_uid' : productUid,
            'cart_uid' : cartUid,
          }
        })
        .then(() => this.fetchOne(cartUid))
      },
      decreaseQuantity (cartUid, productUid) {
        return cartProductModel.findOne({ where : { 'cart_uid' : cartUid, 'product_uid' : productUid } })
        .then(cartProduct => {
          if (cartProduct.quantity > 1) {
            return cartProduct.decrement(`quantity`);
          }
          return this.removeProduct(cartUid, productUid);
        })
        .then(() => this.fetchOne(cartUid))
      },
      fulfillStep (cartUid, stepName, handlerName, infos = {}, fulfillmentStatus = 5) {
        return stepFulfillmentModel.findOne({
          where : { cart_uid : cartUid, step_name : stepName, status : { $gt : -1 } }
        })
        .then(stepFulfillment => {
          if (!stepFulfillment) {
            console.log(`### step not fulfilled yet, creating fulfillment...`);
            return stepFulfillmentModel.create({
              step_name : stepName,
              cart_uid : cartUid,
              handler : handlerName,
              status : fulfillmentStatus,
              infos,
            })
          }
          return stepFulfillment;
        })
      },
      updateStatus (cartUid) {
        return this.findOne({
          where : { uid : cartUid },
          include: [
              { model: productModel, as: `products`, through : cartProductModel, include : [{ model : priceModel, as : `prices` }] },
              { model: stepFulfillmentModel, as: `stepFulfillments`, include : [{ model : stepModel, as: `step` }] },
            ],
        })
        .then(cart => {
          console.log(`### updateStatus cart retrieved`);
          console.log(cart);
          if (cart.status < CART_PROCESSING) {
            const steps = pluginManager.getActiveSteps();
            const fulfilledSteps = steps.filter(step => cart.stepFulfillments.find(fulfillment => step.name === fulfillment.step.name && fulfillment.status >= 5));
            const completedSteps = steps.filter(step => cart.stepFulfillments.find(fulfillment => step.name === fulfillment.step.name && fulfillment.status >= 10));
            if (completedSteps.length === steps.length) {
              return cart.update({ status : CART_ORDERED });
            } else if (fulfilledSteps.length === steps.length) {
              return cart.update({ status : CART_PROCESSING });
            }
          } else if (cart.status >= CART_PROCESSING && cart.status < CART_ORDERED) {
            const steps = cart.stepFulfillments.filter(f => f.status >= 5).map(f => f.step);// uniq ?
            const completedSteps = steps.filter(step => cart.stepFulfillments.find(fulfillment => step.name === fulfillment.step.name && fulfillment.status >= 10));
            if (completedSteps.length === steps.length) {
              return cart.update({ status : CART_ORDERED });
            }
          }
          return cart;
        })
        .then(() => this.fetchOne(cartUid));
      },
      complete (cartUid, force = false) {
        return this.findOne({ where : { uid : cartUid } })
        .then(cart => {
          if (cart.status < CART_ORDERED && !force) {
            throw new Error(`you can't complete a cart if all the steps are not completed`);
          } else {
            return cart.update({ status : CART_COMPLETED })
          }
        })
      }

    }
  }
);

module.exports = cartModel;
