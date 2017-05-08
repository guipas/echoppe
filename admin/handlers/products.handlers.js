'use strict';

const handlers = {
  list (req, res, next) {
    return req.shop.models.product.fetchAll()
    .then(products => res.render(`products/list`, { products, shop : req.shop }))
    .catch(next);
  }
}

module.exports = handlers;
