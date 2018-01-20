'use strict';

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

schema.statics.fetch = function fetch (_id) {
  return this
    .findOne({ _id })
    .populate('uploads')
    .populate('featured');
};

schema.statics.list = function list (options) {
  return this
    .find()
    .skip(options.skip || 0)
    .limit(options.limit || 100)
    .populate('uploads')
    .populate('featured');
};

const Product = mongoose.model('product', schema);

// module.exports = Product;

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
    return await Product.remove({ _id : productId });
  }
};
