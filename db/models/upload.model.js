'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);
const mediaManager = require(`../../lib/media_manager`);

const uploadModel = sequelize.define(`upload`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    name : {
      type: Sequelize.STRING,
      allowNull: true,
    },

    description : {
      type: Sequelize.STRING,
      allowNull: true,
    },

    mimetype : {
      type: Sequelize.STRING,
      allowNull: false,
    },

    filename : {
      type: Sequelize.STRING,
      allowNull: false,
    },

    // products : {
    //   collection: `product`,
    //   via : `images`,
    // }

  }, {
    freezeTableName: true,
    underscored: true,
    classMethods: {
      fetchAll (options = {}) {
        const defaultOptions = {
          itemPerPage : 100,
          page : 1,
          plain : true,
        };
        options = Object.assign({}, defaultOptions, options);
        return this.findAll({
          order: `updated_at DESC`,
          offset : (options.page - 1) * options.itemPerPage,
          limit : options.itemPerPage,
        })
        .then(uploads => {
          if (options.plain) {
            return uploads.map(u => u.get({ plain : true }));
          }
          return uploads;
        })
      },
      getWithThumbnail (uid, format) {
        return this.find({ where  : { uid } })
        .then(upload => {
          if (!upload) { return Promise.reject({ status : 404, message : `image not found` }) }
          return mediaManager.getThumbnail(upload.filename, format)
          .then(filePath => {
            return Object.assign({}, upload.get({ plain : true }), { thumbnail : filePath });
          })
        })
      },
    },
  }
)

module.exports = uploadModel;
