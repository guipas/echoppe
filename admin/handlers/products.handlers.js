'use strict';

const db = require(`../../db/db`);


const handlers = {
  list (req, res) {
    return db.models.product.fetchAll()
    .then(products => res.render(`products/list`, { products }));
  }
}

module.exports = handlers;
