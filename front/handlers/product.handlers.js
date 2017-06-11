'use strict';

const db = require(`../../db/db`);
const path = require(`path`);

const handlers = {
  show : async function (req, res, next) {
    let product = null;
    try {
      product = await req.shop.models.product.fetch(req.params.product);
    } catch (e) {
      next({ message : `product not found`, status : 404, originalError : e });
      return null;
    }

    if (req.wantsJson) {
     return res.json(product);
    }

    return res.render(`product`, {
      product,
      csrf : req.csrfToken(),
    })
  }
}

module.exports = handlers;
