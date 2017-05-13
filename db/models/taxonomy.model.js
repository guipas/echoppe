'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);

const termModel = require(`./term.model`);


const taxonomyModel = sequelize.define(`taxonomy`, {

    uid : {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },

    name : {
      type : Sequelize.STRING,
      allowNull : false,
      unique : true,
    },

    hierarchical : {
      type: Sequelize.BOOLEAN,
      defaultValue : true,
    },

    exclusive : {
      type: Sequelize.BOOLEAN,
      defaultValue : false,
    }

  }, {
    freezeTableName: true,
    underscored: true,
    classMethods: {
      fetchAll () {
        return this.findAll({
          include : [
            { model : termModel, as : `terms` },
          ],
        })
        .then(taxonomies => taxonomies.map(t => t.get({ plain : true })))
      },
      make (name) {
        return this.find({ where : { name } })
        .then(tax => {
          if (tax) { return Promise.reject({ status : 500, message : `Taxonomy already exists` }) }

          return this.create({ name })
          .then(() => this.fetch(name));

        })
      },
      fetch (name) {
        return this.findOne({ where : { name } })
        .then(tax => { return tax ? tax.get({ plain : true }) : null })
      },
      modifyTerms (taxonomiesTerms) {
        return Promise.all(Object.keys(taxonomiesTerms).map(taxonomyId => {
          let terms = taxonomiesTerms[taxonomyId];
          if (!(terms instanceof Array) && typeof terms.split === `function`) { terms = terms.split(`,`) }

          return termModel.destroy({
            where : {
              taxonomy_uid : taxonomyId,
              name : { $notIn : terms }
            }
          })
          .then(() => {
            return Promise.all(terms.map(term => {
              term = term.trim();
              if (!term) { return null }
              console.log(`upsert : ${term}`);
              return termModel.find({ where : { taxonomy_uid : taxonomyId, name : term } })
              .then(foundTerms => {
                console.log(foundTerms)
                if (foundTerms) {
                  console.log(`found term`);
                  return null
                }
                console.log(`did  not found`);
                return termModel.create({ taxonomy_uid : taxonomyId, name : term });
              })
            }))
          })
        }))
      },
    }
  }
);

module.exports = taxonomyModel;
