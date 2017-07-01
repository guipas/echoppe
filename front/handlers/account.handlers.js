'use strict';

const handlers = {
  index: async function (req, res, next) {
    const status = req.shop.status.cart;
    const orders = await req.shop.models.cart.fetchAll({
      status : [status.CART_PROCESSING, status.CART_ORDERED, status.CART_COMPLETED],
      userUid : req.shop.current.user.uid,
    });

    res.render(`account`, { orders });
  },
}

module.exports = handlers;
