'use strict';

const bcrypt = require(`bcryptjs`);
const Sequelize = require(`sequelize`);
const sequelize = require(`../sequelize`);
const config = require(`../../config`);

// const User = Waterline.Collection.extend({

//   identity: `user`,
//   connection: `default`,

//   attributes: {

//     uid: {
//       type: Sequelize.STRING,
//       primaryKey: true,
//       uuidv4: true,
//       defaultsTo: () => uuid.v4()
//     },

//     email: {
//       type: Sequelize.STRING,
//       email: true,
//       required: true,
//       unique: true
//     },

//     name: {
//       type: Sequelize.STRING,
//       required: false,
//     },

//     password: {
//       type: Sequelize.STRING,
//       required: true
//     },

//     role: {
//       type: Sequelize.STRING,
//       required: false,
//       defaultsTo: () => null,
//     },

//     attempts: {
//       type: `integer`,
//       defaultsTo: () => 0,
//     },

//     toJSON () {
//       const obj = this.toObject();
//       delete obj.password;
//       return obj;
//     }
//   },

//   beforeCreate (values, next) {

//     bcrypt.genSalt(10, function (err, salt) {
//       if (err) return next(err);

//       bcrypt.hash(values.password, salt, function (err, hash) {
//         if (err) return next(err);

//         values.password = hash;
//         next();
//       });
//     });
//   }
// });

const userModel = sequelize.define(`user`, {
  uid: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },

  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true,
    },
    allowNull: false,
    unique: true
  },

  name: {
    type: Sequelize.STRING,
    required: false,
  },

  password: {
    type: Sequelize.STRING,
    allowNull: true
  },

  role: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  attempts: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },

  lastLogin : {
    type : Sequelize.DATE,
    defaultValue : new Date(0),
  },

  active : {
    type : Sequelize.BOOLEAN,
    defaultValue : false,
  },

  loginLevel: {
    type: Sequelize.VIRTUAL(Sequelize.STRING, [`lastLogin`]),
    get () {
      if (this.get(`lastLogin`) > Date.now() - config.secureLoginTimestamp) {
        return `high`;
      }
      return `low`;
    }
  }
}, {
  freezeTableName: true,
  underscored: true,
  classMethods: {
    make (user) {
      return new Promise((resolve, reject) => {
        if (!user.password) {
          user.active = false;
          return resolve();
        }
        user.active = true;
        bcrypt.genSalt(10, function (err, salt) {
          if (err) return reject(err);

          bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return reject(err);

            user.password = hash;
            console.log(user);
            resolve();
          });
        });
      })
      .then(() => this.create(user));
    },
    fetchOne (userId) {
      return this.findOne({
        where : {
          uid : userId,
        }
      });
    },
    fetchByEmail (email) {
      return this.findOne({
        where : { email },
      })
    },
  },
});

module.exports = userModel;
