'use strict';

const handlers = {
  list (req, res) {
    return req.shop.models.cart.fetchAll()
    .then(orders => res.render(`orders/list`, { orders }));
  },
  details (req, res, next) {
    return req.shop.models.cart.fetchOne(req.params.order)
    .then(order => {
      if (req.wantsJson) {
        res.json(order);
        return null;
      }
      console.log(order);
      return res.render(`orders/details`, { order })
    })
    .catch(next);
  },
}

module.exports = handlers;
