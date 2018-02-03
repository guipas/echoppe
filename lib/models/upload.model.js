'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const productModel = require('./product.model');
const config = require('../config');
const url = require('url');

const schema = new mongoose.Schema({
  name: { type : String, required : true },
  filename : { type : String, required : true },
  description: { type : String, required : false },
  type : { type : String, required : false },
  product : { type : mongoose.Schema.Types.ObjectId, ref : 'product' }
}, {
  toJSON : { virtuals : true },
  id : true,
  timestamps : true,
});

schema.virtual('link').get(function getLink () {
  return url.resolve(config.url, ['uploads', this.id].join('/'));
});

schema.statics.add = function add ({ name, description, type, product, filename }) {
  return this.create({
    name, description, type, filename,
    product : mongoose.Types.ObjectId(product),
  });
};

schema.statics.addBulk = function addBulk (uploads) {
  return Promise.all(uploads.map(u => this.add(u)));
};

schema.statics.destroy = function destroy (upload) {
  const id = upload.id || upload;
  return this.remove({ id });
  // mongoose.Types.ObjectId(_id)
}

schema.statics.fetch = function fetch (_id) {
  return this.findOne({ _id });
  // mongoose.Types.ObjectId(_id)
}

const Upload = mongoose.model('upload', schema);

module.exports = Upload;
