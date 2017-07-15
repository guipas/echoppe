'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);
const productModel = require(`./product.model`);
const priceModel = require(`./price.model`);
const cartProductModel = require(`./cart_product.model`);
const stepFulfillmentModel = require(`./step_fulfillment.model`);
const stepModel = require(`./step.model`);
const userModel = require(`./user.model`);
const addressModel = require(`./address.model`);
const pluginManager = require(`../../lib/plugin_manager`);

const status = require(`./cart.status`);
const stepFulfillmentStatus = require(`./step_fulfillment.status`);

const LABELS = {
  [status.CART_NEW] : ``,
  [status.CART_LOCKED] : ``,
  [status.CART_PROCESSING] : `Processing (awaiting validation)`,
  [status.CART_ORDERED] : `Accepted (products can be sent)`,
  [status.CART_COMPLETED] : `Product sent`,
};


const cartModel = sequelize.define(`cart`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    status : {
      type: Sequelize.INTEGER,
      defaultValue : status.CART_NEW,
    },

    currentStep : {
      type : Sequelize.STRING,
      allowNull : true,
    },

    currentStepHandler : {
      type : Sequelize.STRING,
      allowNull : true,
    },

    statusLabel : {
      type: Sequelize.VIRTUAL(Sequelize.STRING),
      get () {
        return LABELS[this.getDataValue(`status`)];
      }
    }

  }, {
    freezeTableName: true,
    underscored: true,
    classMethods : {
      status () {
        return status;
      },
      nextStatus (currentStatus) {
        let i = currentStatus;
        let nextStatus = null;
        while (!nextStatus && i++ < 100) {
          if (LABELS[i]) {
            nextStatus = i;
          }
        }
        return nextStatus;
      },
      fetch (uid) { return this.fetchOne(uid) },
      fetchOne (uid) {
        console.log(`fetching cart...`);
        console.log(uid);
        return this.findOne({
          where : { uid },
          include: [
              { model: productModel, as: `products`, through : cartProductModel, include : [{ model : priceModel, as : `prices` }] },
              { model: stepFulfillmentModel, as: `stepFulfillments`, include : [{ model : stepModel, as: `step` }] },
              { model: userModel },
              { model: addressModel, as: `shipping_address` },
            ],
        })
        .then(cart => cart.get({ plain : true }))
      },
      getTotal (uid, options) {
        options = Object.assign({
          cents: true, // mutliply total * 100 and returns an int (for some payment platforms)
          fees: true, // include fees in total
        }, options);

        return this.fetch(uid)
        .then(cart => {
          if (!cart) return Promise.reject();

          console.log(cart);
          let total = cart.products.reduce((total, product) => total + product.price.value * product.cart_product.quantity, 0.0);

          if (options.fees) {
            cart.stepFulfillments.forEach(fulfillment => {
              total += fulfillment.fee;
            })
          }

          if (options.cents) {
            total *= 100;
            total = Math.round(total);
          }

          return total;
        })
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
      putProduct (cartUid, productUid, userUid) {
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
            return this.create({ user_uid : userUid }).then(cart => cart.addProduct(product).then(() => cart));
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
        .then(cart => this.resetOrderProcess(cart.uid).then(() => cart))
        .then(cart => this.fetchOne(cart.uid))
      },
      removeProduct (cartUid, productUid) {
        return cartProductModel.destroy({
          where : {
            'product_uid' : productUid,
            'cart_uid' : cartUid,
          }
        })
        .then(() => this.resetOrderProcess(cartUid))
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
        .then(() => this.resetOrderProcess(cartUid))
        .then(() => this.fetchOne(cartUid))
      },
      fulfillStep (cartUid, stepName, handlerName, infos = {}, fulfillmentStatus = stepFulfillmentStatus.STEP_COMPLETED, fee = 0) {
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
              fee,
            })
          }

          return stepFulfillmentModel.update({
            handler : handlerName,
            status : fulfillmentStatus,
            infos,
            fee,
          }, { where : { uid : stepFulfillment.uid } })
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
          const stepFulfillmentStatus = stepFulfillmentModel.status();
          if (cart.status < status.CART_PROCESSING) {
            const steps = pluginManager.getActiveSteps();
            // const chosenSteps     = steps.filter(step => cart.stepFulfillments.find(fulfillment => step.name === fulfillment.step.name && fulfillment.status >= stepFulfillmentStatus.STEP_CHOSEN));
            const processingSteps = steps.filter(step => cart.stepFulfillments.find(fulfillment => step.name === fulfillment.step.name && fulfillment.status >= stepFulfillmentStatus.STEP_PROCESSING));
            const completedSteps  = steps.filter(step => cart.stepFulfillments.find(fulfillment => step.name === fulfillment.step.name && fulfillment.status >= stepFulfillmentStatus.STEP_COMPLETED));
            if (completedSteps.length === steps.length) {
              return cart.update({ status : status.CART_ORDERED });
            } else if (processingSteps.length === steps.length) {
              return cart.update({ status : status.CART_PROCESSING });
            }
          } else if (cart.status >= status.CART_PROCESSING && cart.status < status.CART_ORDERED) {
            const steps = cart.stepFulfillments.filter(f => f.status >= stepFulfillmentStatus.STEP_PROCESSING).map(f => f.step);// uniq ?
            const completedSteps = steps.filter(step => cart.stepFulfillments.find(fulfillment => step.name === fulfillment.step.name && fulfillment.status >= stepFulfillmentStatus.STEP_COMPLETED));
            if (completedSteps.length === steps.length) {
              return cart.update({ status : status.CART_ORDERED });
            }
          }
          return cart;
        })
        .then(() => this.fetchOne(cartUid));
      },
      forceStatus (cartUid, newStatus) {
        return this.findOne({ where : { uid : cartUid } })
        .then(cart => {
          if (!LABELS[newStatus]) {
            return Promise.reject(`status does not exists`);
          }
          return cart.update({ status : newStatus })
        })
        .then(() => this.fetchOne(cartUid))
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
      },
      fetchAll (options = {}) {
        const defaultOptions = {
          status : [status.CART_PROCESSING, status.CART_ORDERED],
          itemPerPage : 100,
          page : 1,
          plain : true,
        };
        options = Object.assign({}, defaultOptions, options);

        const where = { status : { $in : options.status } };
        if (options.userUid) { where.user_uid = options.userUid }

        return this.findAll({
          order: `updated_at DESC`,
          offset : (options.page - 1) * options.itemPerPage,
          limit : options.itemPerPage,
          where,
          include : [
            { model : userModel }
          ]
        })
        .then(orders => {
          if (options.plain) {
            return orders.map(o => o.get({ plain : true }));
          }
          return orders;
        })
      },
      setShippingAddress (cartUid, addressUid) {
        return addressModel.update({ cart_uid : cartUid }, { where : { uid : addressUid } })
        .then(() => this.fetch(cartUid));
      },
      modify (cartUid, values) {
        return this.update(values, { where : { uid : cartUid } })
        .then(() => this.fetch(cartUid));
      },
      resetOrderProcess (uid) {
        return this.update({
          currentStepHandler: null,
          currentStep: null,
        }, { where: { uid } })
        .then(() => stepFulfillmentModel.update({
          status: stepFulfillmentStatus.STEP_CHOSEN
        }, { where: {
          cart_uid: uid,
          status: { $gt : stepFulfillmentStatus.STEP_CHOSEN },
        } }))
      },

    }
  }
);

module.exports = cartModel;
