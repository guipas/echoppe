'use strict';

const db = require(`../db/db`);

const firstTime = {
  launching () {
    return db.models.user.count()
    .then(count => { if (count > 0) return Promise.reject(); return true })
    .then(() => db.models.product.count())
    .then(productCount => { if (productCount > 0) return Promise.reject(); return true })
    .catch(() => false)
  },
  connecting () {
    return db.models.user.count()
    .then(count => { if (count > 0) return Promise.reject(); return true })
    .catch(() => false)
  },
}


module.exports = firstTime;
