'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const stepModel = sequelize.define(`step`, {

  name : {
    primaryKey: true,
    type: Sequelize.STRING,
    unique : true,
    allowNull : false,
  },

  activated : {
    type: Sequelize.BOOLEAN,
    defaultValue : true,
  }

  }, {
    freezeTableName: true,
    underscored: true,
    classMethods : {
      fetchAll () {
        return this.findAll()
        .then(steps => steps.map(step => step.get({ plain : true })))
      },
      fetch (name) {
        return this.findOne({ where : { name } })
        .then(step => step.get({ plain : true }));
      },
      changeActivation (stepName, activated = false) {
        return this.update({ activated }, { where : { name : stepName } })
        .then(([nbRows]) => {
          if (!nbRows) {
            console.log(`creating step...`);
            return this.create({ name : stepName, activated })
          }
          return null;
        })
        .then(() => this.fetch(stepName))
      }
    }
  }
);

module.exports = stepModel;
