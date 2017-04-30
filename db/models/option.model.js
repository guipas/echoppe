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
      fetch (name) {
        return this.findOne({ where : { name } })
        .then(option => {
          if (!option) return { name, value : null }
          return { name : option.name, value : this._getParsedValue(option) }
        });
      },
      fetchValue (name) {
        return this.fetch(name).then(option => option.value);
      },
      getOptionsByGroup (group) {
        return this.find({ where : { group } })
        .then(options => options.map(option => ({ name : option.name, value : this._getParsedValue(option) })));
      },
      setValue (name, value, type) {
        return this.setOption({ name, value, type });
      },
      setOption (option) {
        return this.upsert(this._prepareBeforeSave(option))
        .then(() => this.fetch(option.name))
      }
    },
  }
);

module.exports = optionModel;
