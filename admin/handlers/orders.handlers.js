'use strict';

const handlers = {
  list (req, res) {
    return req.shop.models.cart.fetchAll()
    .then(orders => res.render(`orders/list`, { orders }));
  }
}

module.exports = handlers;
