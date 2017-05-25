'use strict';

const Sequelize = require(`sequelize`);
const path = require(`path`);
const sequelize = require(`../sequelize`);
const uploadModel = require(`./upload.model`);
const priceModel = require(`./price.model`);
const uploadProductModel = require(`./upload_product.model`);
const termModel = require(`./term.model`);
const productTermModel = require(`./product_term.model`);

const config = require(`../../config`);

const productModel = sequelize.define(`product`, {

  uid: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },

  name: {
    type: Sequelize.STRING,
  },

  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  stock : {
    type : Sequelize.INTEGER,
    defaultValue : 0,
  },

  type : {
    type : Sequelize.STRING,
    defaultValue: ``,
  },

  // parent : {
  //   model : `product`,
  //   required : false,
  // },

  // root : {
  //   model : `product`,
  //   required : false,
  // },

  visible: {
    type: Sequelize.BOOLEAN,
    defaultValue : false,
  },

  deleted: {
    type: Sequelize.BOOLEAN,
    defaultValue : false,
  },

  price : {
    type: Sequelize.VIRTUAL,
    get () {
      if (this.get('prices') && this.get('prices').length) {
        const price = this.get('prices').find(p => p.currency === config.defaultCurrency);
        if (price) return price.get();
        return this.get('prices')[0].get();
      }
      return null;
    }
  }

}, {
  freezeTableName: true,
  underscored: true,
  classMethods: {
    make (product, files) {
      let uploads = [];
      if (files && files.length) {
        uploads = files.map(file => ({
          name: file.originalname,
          mimetype: file.mimetype,
          filename: path.basename(file.path),
        }))
      }
      return this.create({
        name : product.name,
        description : product.description,
        prices : [{ value : product.price ? product.price : 0 }],
        uploads,
      }, {
        include: [
          { model: uploadModel, as: `uploads` },
          { model: priceModel, as: `prices` },
        ],
      })
      .then(prod => {
        const terms = Object.keys(product.taxonomies)
          .map(k => ({
            term_uid : product.taxonomies[k],
            product_uid : prod.uid,
          }))
          .filter(term => term.term_uid.length > 0);
        return productTermModel.bulkCreate(terms)
        .then(() => prod)
      })
    },
    modify (product, files) {
      console.log(product);
      let uploads = [];
      if (files && files.length) {
        uploads = files.map(file => ({
          name: file.originalname,
          mimetype: file.mimetype,
          filename: path.basename(file.path),
        }))
      }
      return this.findOne({
        where : { uid : product.uid },
        include: [
          {
            model: uploadModel,
            through : uploadProductModel,
            as : `uploads`,
          },
          {
            model: priceModel,
            as : `prices`,
          }
        ],
      })
      .then(prod => {
        return prod.update({
          name : product.name,
          description : product.description,
        })
        .then(() => prod.prices[0].update({ value : product.price }))
        .then(() => {
          if (product.unlinkUploads && product.unlinkUploads.length > 0) {
            return uploadProductModel.destroy({
              where : {
                upload_uid : { $in : product.unlinkUploads },
                product_uid : product.uid,
              }
            })
          }
          return prod;
        })
        .then(() => uploadModel.bulkCreate(uploads))
        .then(uploads => uploadProductModel.bulkCreate(uploads.map(u => ({ product_uid : prod.uid, upload_uid : u.uid }))))
        .then(() => {
          const terms = Object.keys(product.taxonomies)
            .map(k => ({
              term_uid : product.taxonomies[k],
              product_uid : prod.uid,
            }))
            .filter(term => term.term_uid.length > 0);
          // console.log(`terms :`);
          // console.log(terms);
          return productTermModel.destroy({ where : { product_uid : prod.uid } })
          .then(() => productTermModel.bulkCreate(terms))
        })
      })
      .then(() => this.fetch(product.uid));
    },
    fetch (uid) {
      return this.findOne({
        where : { uid },
        include: [
          {
            model: uploadModel,
            through : uploadProductModel,
            as : `uploads`,
          },
          {
            model: priceModel,
            as : `prices`,
          },
          {
            model : termModel,
            as : `terms`,
            through : productTermModel,
          }
        ],
      })
      .then(product => product.get({ plain : true }))
    },
    fetchOne (...args) { return this.fetch(...args); },
    fetchAll (options = {}) {
      const defaultOptions = {
        itemPerPage : 100,
        page : 1,
        plain : true,
      };
      options = Object.assign({}, defaultOptions, options);
      return this.findAll({
        order : `updated_at DESC`,
        where : {},
        offset : (options.page - 1) * options.itemPerPage,
        limit : options.itemPerPage,
        include: [
          {
            model: uploadModel,
            through : uploadProductModel,
            as : `uploads`,
          },
          {
            model: priceModel,
            as : `prices`,
          }
        ]
      })
      .then(products => products.map(p => p.get({ plain : true })))
      // .then(products => products.map(p => setPriceProp(p)))
    }
  },
  // instanceMethods: {
  //   method3: function() {}
  // }
});




module.exports = productModel;
