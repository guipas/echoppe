'use strict';

const mongoist = require('mongoist');
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id : String,
  name: String,
  description: String,
  price : Number,
  stock : Number,
  // uploads : [{ type : mongoose.Schema.Types.ObjectId, ref : 'upload' }],
  featured : { type : mongoose.Schema.Types.ObjectId, ref : 'upload' },
},  { toJSON : { virtuals : true } });

schema.virtual('uploads', {
  ref: 'upload', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'product', // is equal to `foreignField`
});

const Product = mongoose.model('product', schema);

module.exports = {
  async list (options) {
    const queryOptions = {
      limit : 1,
      ...options,
    };
    const products = await Product.find().populate(['uploads', 'featured']);
    return products;
  },
  async add (prod) {
    console.log(`add product...`, prod);
    const product = new Product({
      ...prod,
      id : uuidv4(),
    });
    return await product.save();
  },
  async fetch(id, customOptions = {}) {
    const options = {
      populate : ['uploads', 'featured'],
      ...customOptions,
    }
    let prom = Product.findOne({ id });
    options.populate.forEach(field => prom = prom.populate(field));
    const product = await prom;

    return product;
  },
  async modify (product) {
    Reflect.deleteProperty(product, `_id`);
    // await db.products.update({ _id : mongoist.ObjectId(product.id) }, product);
    await Product.update({ id : product.id }, product);
  },
  async destroy (product) {
    const productId = product.id || product;
    return await Product.remove({ id : productId });
  }
};