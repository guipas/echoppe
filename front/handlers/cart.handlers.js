'use strict';

const db = require(`../../db/db`);

const handlers = {
  list (req, res) {
    if (req.shop.current.cart) {
        if (req.wantsJson) {
          res.json(req.shop.current.cart);
        } else res.render(`cart`, { cart : req.shop.current.cart });
        return null;
    }
    console.log(`no cart in session`);
    if (res.wantsJson) res.json({});
    else res.render(`cart`);

    return null;
  },
  addProduct (req, res) {
    return db.models.cart.putProduct(req.session.cartUid, req.params.product)
    .then(cart => {
      console.log(`cart created or retrieved !`);
      console.log(cart);
      if (!req.session.cartUid) { req.session.cartUid = cart.uid }

      if (req.wantsJson) { res.json(cart); }
      // else res.render(`cart`, { cart });
      else res.redirect(res.app.locals.linkTo(`/cart`));

      return null;
    })
  }
}

module.exports = handlers;
