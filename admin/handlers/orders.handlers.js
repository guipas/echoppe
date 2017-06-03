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
      const nextStatus = req.shop.models.cart.getNextStatus(order.status);
      console.log(nextStatus);
      const allStatus = req.shop.models.cart.getAllPosssibleStatus();
      let nextLabel = null;
      if (nextStatus === allStatus.CART_ORDERED) { nextLabel = 'Manualy validate order' }
      else if (nextStatus === allStatus.CART_COMPLETED) { nextLabel = `Complete order (mark as sent)` }
      res.render(`orders/details`, {
        order,
        csrf : req.csrfToken(),
        nextStatus,
        nextLabel,
      });
      return null;
    })
    .catch(next);
  },
  changeStatus (req, res, next) {
    return req.shop.models.cart.forceStatus(req.params.order, req.body.status)
    .then(cart => {
      if (req.wantsJson) {
        res.json(cart);
        return null;
      }
      res.redirect(req.app.locals.linkTo(`order`, cart.uid));
      return null;
    })
    .catch(next);
  }
}

module.exports = handlers;
