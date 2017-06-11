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

    label : {
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
      getOptionsByGroup (group, defaults = []) {
        return this.findAll({ where : { name : { $like : `${group}:%` } } })
        .then(options => options.map(option => ({ name : option.name, value : this._getParsedValue(option), type : option.type, group : option.group })))
        .then(options => {
          defaults.forEach(defaultOption => {
            const option = options.find(o => o.name === defaultOption.name);
            if (!option) {
              options.push(defaultOption);
            }
          })
          return options;
        })
      },
      setValue (name, value, type = null, group = null) {
        const option = { name, value };
        if (type) option.type = type;
        if (group) option.group = group;
        return this.setOption(option);
      },
      setOption (option) {
        return this.upsert(this._prepareBeforeSave(option))
        .then(() => this.fetch(option.name))
      },
      setOptions (options) {
        return Promise.all(options.map(option => {
          return this.setOption(option);
        }))
      }
    },
  }
);

module.exports = optionModel;
