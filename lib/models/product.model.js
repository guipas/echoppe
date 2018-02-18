'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type : String, required : true },
  description: { type : String, required : false },
  price : { type : Number, default : 0 },
  activated : { type : Boolean, default : false },
  stock : { type : Number, default : 0 },
  featured : { type : mongoose.Schema.Types.ObjectId, ref : 'upload', required : false },
}, {
  toJSON : { virtuals : true },
  timestamps : true,
  id : true,
});

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

schema.statics.list = function list (options = {}) {
  return this
    .find()
    .skip(options.skip || 0)
    .limit(options.limit || 100)
    .populate('uploads')
    .populate('featured');
};

schema.statics.modify = async function modify (product) {
  const productId = product._id || product;
  const productToUpdate = await this.findOne({ _id : productId });
  await productToUpdate.update(product);
  return productToUpdate;
  // return this.update({ _id : productId }, product);
};

schema.statics.add = function add (product) {
  return this.create(product);
};

schema.statics.destroy = function destroy (product) {
  const productId = product._id || product;
  return this.remove({ _id : productId });
};

const Product = mongoose.model('product', schema);

module.exports = Product;
