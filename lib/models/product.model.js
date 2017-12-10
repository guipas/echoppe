'use strict';

const mongoist = require('mongoist');
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: String,
  description: String,
  price : Number,
  stock : Number,
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
      limit : 10,
      ...options,
    };
    const products = await Product.find().populate(['uploads', 'featured']);
    return products;
  },
  async add (prod) {
    console.log(`add product...`, prod);
    const product = new Product({
      ...prod,
    });
    return await product.save();
  },
  async fetch (_id, customOptions = {}) {
    const options = {
      populate : ['uploads', 'featured'],
      ...customOptions,
    }
    let prom = Product.findOne({ _id });
    options.populate.forEach(field => prom = prom.populate(field));
    const product = await prom;

    return product;
  },
  async modify (product) {
    await Product.update({ _id : product._id }, product)
  },
  async destroy (product) {
    const productId = product._id || product;
    return await Product.remove({ id : productId });
  }
};
