'use strict';

const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);
const _ = require(`lodash`);


const simpleDatastoreModel = sequelize.define(`simple_datastore`, {

    key : {
      primaryKey: true,
      type: Sequelize.STRING,
      allowNull : false,
      unique : true,
    },

    type : {
      type : Sequelize.STRING,
      defaultValue : `string`,
    },

    value : {
      type : Sequelize.TEXT,
      defaultValue : ``,
    }

  }, {
    freezeTableName: true,
    underscored: true,
    classMethods : {
      _getParsedValue (piece) {
        if (piece.type === `integer`) { return parseInt(piece.value, 10) }
        else if (piece.type === `float`) { return parseFloat(piece.value) }
        else if (piece.type === `object`) { return JSON.parse(piece.value) }
        return piece.value;
      },
      _prepareBeforeSave (piece) {
        if (piece.type === `object` || typeof piece.value === `object`) return Object.assign({}, piece, { value : JSON.stringify(piece.value), type : `object` })
        return Object.assign({}, piece, { value : piece.value.toString() })
      },
      fetch (key) {
        return this.findOne({ where : { key } })
        .then(option => {
          if (!option) return { key, value : null }
          return { name : option.key, value : this._getParsedValue(option) }
        });
      },
      fetchValue (key) {
        return this.fetch(key).then(option => option.value);
      },
      fetchByGroup (group, defaults = []) {
        return this.findAll({ where : { key : { $like : `${group}:%` } } })
        .then(pieces => pieces.map(piece => ({ key : piece.key, value : this._getParsedValue(piece), type : piece.type })))
        .then(pieces => {
          defaults.forEach(d => {
            const piece = pieces.find(o => o.name === d.name);
            if (!piece) {
              pieces.push(d);
            }
          })
          return pieces;
        })
      },
      setValue (key, value, type = null) {
        const piece = { key, value };
        if (type) piece.type = type;
        return this.update(piece);
      },
      update (pieces) {
        pieces = [].concat(pieces);
        return Promise.all(pieces.map(piece => {
          return this.upsert(this._prepareBeforeSave(piece))
          .then(() => this.fetch(piece.key))
        }))
      },
      prefixKey (key, prefix) {
        return key.indexOf(prefix) === 0 ? key : `${prefix}:${key}`;
      },
      prefixPieces (pieces, prefix) {
        if (Array.isArray(pieces)) {
          return pieces.map(piece => Object.assign({}, piece, { key : this.prefixKey(piece.key, prefix) }));
        }

        return Object.assign({}, pieces, { key : this.prefixKey(pieces.key, prefix) });
      },
      proxiedStore (keyPrefix) {
        return {
          update: pieces => this.update(this.prefixPieces(pieces, keyPrefix)),
          setValue: (key, value, type) => this.setValue(this.prefixKey(key, keyPrefix), value, type),
          fetchByGroup: (...args) => this.fetchByGroup(...args),
          fetchValue: key => this.fetchValue(this.prefixKey(key, keyPrefix)),
          fetch: key => this.fetch(this.prefixKey(key, keyPrefix)),
        }
      }
    },
  }
);

module.exports = simpleDatastoreModel;
