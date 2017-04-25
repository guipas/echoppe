'use strict';

const db = require(`../../db/db`);

const handlers = {
  showCreate (req, res) {
    return res.render(`product/create`, {
      csrf: req.csrfToken(),
    });
  },
  create (req, res) {
    return db.models.product.make({
      name : req.body.name,
      description : req.body.description,
      price : req.body.price,
    }, req.files)
    .then(product => {
      if (req.wantsJson) {
        res.json({ status : `success`, data : product });
        return null;
      }
      res.redirect(res.app.locals.linkTo(`/products`));
      return null;
    })
    .catch(err => {
      console.log(`Error while saving product`);
      console.log(err);
      return null;
    })
  }
}

module.exports = handlers;
