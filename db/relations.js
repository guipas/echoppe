'use strict';

const userModel = require(`./models/user.model`);
const productModel = require(`./models/product.model`);
const priceModel = require(`./models/price.model`);
const uploadModel = require(`./models/upload.model`);
const cartModel = require(`./models/cart.model`);
const cartProductModel = require(`./models/cart_product.model`);
const stepModel = require(`./models/step.model`);
const stepFulfillmentModel = require(`./models/step_fulfillment.model`);
const uploadProductModel = require(`./models/upload_product.model`);

productModel.hasMany(priceModel, { as: `prices` });
priceModel.belongsTo(productModel);

// productModel.hasMany(productModel, { as : `children` });
productModel.belongsTo(productModel, { as : `parent` });

uploadModel.belongsToMany(productModel, { through : uploadProductModel, as : `products` });
productModel.belongsToMany(uploadModel, { through : uploadProductModel, as : `uploads` });

cartModel.belongsTo(userModel);
cartModel.belongsToMany(productModel, { through : cartProductModel, as : `products` });
productModel.belongsToMany(cartModel, { through : cartProductModel, as : `carts` });

cartModel.hasMany(stepFulfillmentModel, { as : `stepFulfillments` });
stepFulfillmentModel.belongsTo(cartModel);
stepFulfillmentModel.belongsTo(stepModel);
stepModel.hasMany(stepFulfillmentModel, { as : `stepFulfillments` })

