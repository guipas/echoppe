'use strict';

const Sequelize = require(`sequelize`);
const path = require(`path`);
const sequelize = require(`../sequelize`);
const uploadModel = require(`./upload.model`);
const priceModel = require(`./price.model`);
const config = require(`../../config`);

// const setPriceProp = product => {
//   if (product.prices && product.prices.length) {
//     const defaultPrice = product.prices.find(p => p.currency === config.defaultCurrency);
//     if (defaultPrice) product.price = defaultPrice;
//     else product.price = product.prices[0];
//   }

//   return product;
// }

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

  // images : {
  //   collection : `media`,
  //   via : `products`,
  // },

  // price : {
  //   collection : `price`,
  //   via  : `product`,
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
      console.log(`price :`);
      console.log(product.price);
      return this.create({
        name : product.name,
        description : product.description,
        prices : [{ value : product.price }],
        uploads,
      }, {
        include: [
          { model: uploadModel, as: `uploads` },
          { model: priceModel, as: `prices` },
        ],
      })
    },
    fetchAll () {
      return this.findAll({
        include: [
          {
            model: uploadModel,
            through : `upload_product`,
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
