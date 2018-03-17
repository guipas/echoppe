'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const productModel = require('./product.model');
const config = require('../config');
const url = require('url');

const schema = new mongoose.Schema({
  name: { type : String, required : true },
  filename : { type : String, required : false },
  description: { type : String, required : false },
  type : { type : String, required : false },
  product : { type : mongoose.Schema.Types.ObjectId, ref : 'product', required : false },
  url : { type : String, required : false, default : null },
}, {
  toJSON : { virtuals : true },
  id : true,
  timestamps : true,
});

schema.virtual('link').get(function getLink () {
  if (this.filename) {
    return url.resolve(config.url, ['uploads', this.id].join('/'));
  }

  return this.url;
});

schema.statics.add = function add ({ name, description, type, product, filename, url }) {
  return this.create({
    name, description, type, filename, url,
    product : mongoose.Types.ObjectId(product),
  });
};

schema.statics.addBulk = function addBulk (uploads) {
  return Promise.all(uploads.map(u => this.add(u)));
};

schema.statics.destroy = function destroy (upload) {
  const id = upload.id || upload;
  return this.remove({ _id : id });
}

schema.statics.fetch = function fetch (_id) {
  return this.findOne({ _id });
}

const Media = mongoose.model('media', schema);

module.exports = Media;
