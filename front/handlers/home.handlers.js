'use strict';



const handlers = {
  home : async function (req, res, next) {
    const products = await req.shop.models.product.fetchAll();

    res.render(`index`, { products, csrfToken : req.csrfToken() });
    return null;
  },
}

module.exports = handlers;
