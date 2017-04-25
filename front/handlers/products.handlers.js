'use strict';

const db = require(`../../db/db`);

const handlers = {
  list (req, res) {
   return db.models.product.fetchAll()
   .then(products => {
    //  console.log(products);
     if (res.wantsJson) {
       return res.json(products);
     }
     return res.render(`products/list`, { products, csrfToken : req.csrfToken() });
   })
  }
}

module.exports = handlers;
