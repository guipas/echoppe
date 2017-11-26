'use strict';

const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
const _ = require('lodash');
const productModel = require('./product.model');
const config = require('../config');
const url = require('url');

const schema = new mongoose.Schema({
  id : String,
  name: String,
  filename : String,
  description: String,
  type : String,
  product : { type : mongoose.Schema.Types.ObjectId, ref : 'product' }
}, { toJSON : { virtuals : true } });

schema.virtual('link').get(function () {
  return url.resolve(config.url, ['uploads', this.id].join('/'));
});

const Upload = mongoose.model('upload', schema);

module.exports = {
  async add ({ name, description, type, product, filename }) {
    const upload = new Upload({
      id : uuidv4(),
      name, description, type, filename,
      product : mongoose.Types.ObjectId(product),
    });
    await upload.save();

    return upload;
  },
  async addBulk(uploads) {
    return await Promise.all(uploads.map(this.add))
  },
  async destroy (upload) {
    const id = upload.id || upload;
    return await Upload.remove({ id });
  },
  async fetch (id) {
    return await Upload.findOne({ id });
  },
};