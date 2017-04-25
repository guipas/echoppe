'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);


const optionModel = sequelize.define(`option`, {

    name : {
      primaryKey: true,
      type: Sequelize.STRING,
      allowNull : false,
      unique : true,
    },

    group : {
      type: Sequelize.STRING,
      defaultValue : ``,
    },

    type : {
      type : Sequelize.STRING,
      defaultValue : `string`,
    },

    value : {
      type : Sequelize.STRING,
      defaultValue : ``,
    }

  }, {
    freezeTableName: true,
    underscored: true,
    classMethods : {
      _getParsedValue (option) {
        if (option.type === `integer`) { return parseInt(option.value, 10) }
        else if (option.type === `float`) { return parseFloat(option.value) }
        else if (option.type === `object`) { return JSON.parse(option.value) }
        return option.value;
      },
      _prepareBeforeSave (option) {
        if (option.type === `object` || typeof option.value === `object`) return Object.assign({}, option, { value : JSON.stringify(option.value), type : `object` })
        return Object.assign({}, option, { value : option.value.toString() })
      },
      getOption (name) {
        return this.findOne({ where : { name } })
        .then(option => ({ name : option.name, value : this._getParsedValue(option) }));
      },
      getOptionsByGroup (group) {
        return this.find({ where : { group } })
        .then(options => options.map(option => ({ name : option.name, value : this._getParsedValue(option) })));
      },
      setOption (option) {
        return this.upsert(this._prepareBeforeSave(option))
        .then(() => this.getOption(option.name))
      }
    },
  }
);

module.exports = optionModel;
