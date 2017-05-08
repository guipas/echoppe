'use strict';

const handlers = {
  showCreate (req, res) {
    return res.render(`product/create`, {
      csrf: req.csrfToken(),
      product : null,
    });
  },
  create (req, res, next) {
    return req.shop.models.product.make({
      name : req.body.name,
      description : req.body.description,
      price : req.body.price,
    }, req.files)
    .then(product => {
      if (req.wantsJson) {
        res.json({ status : `success`, data : product });
        return null;
      }
      if (product) {
        res.redirect(res.app.locals.linkTo(`/product`, product.uid));
        return null;
      }
      res.redirect(res.app.locals.linkTo(`/products`));
      return null;
    })
    .catch(next)
  },
  modify (req, res, next) {
    let unlinkUploads = [];
    if (req.body.uploads && req.body.uploads.length > 0) unlinkUploads = Object.keys(req.body.uploads).filter(u => req.body.uploads[u] === `on`);

    return req.shop.models.product.modify({
      uid : req.params.product,
      name : req.body.name,
      description : req.body.description,
      price : req.body.price,
      unlinkUploads,
    }, req.files)
    .then(product => {
      if (req.wantsJson) {
        res.json({ status : `success`, data : product });
        return null;
      }
      if (product) {
        res.redirect(res.app.locals.linkTo(`/product`, product.uid));
        return null;
      }
      res.redirect(res.app.locals.linkTo(`/products`));
      return null;
    })
    .catch(next);
  },
  details (req, res, next) {
    return req.shop.models.product.fetchOne(req.params.product)
    .then(product => {
      if (!product) { return Promise.reject({ status : 404, message : `product not found` }) }
      if (req.wantsJson) {
        res.json(product);
        return null;
      }
      // console.log(product);
      res.render(`product/create`, { product, csrf: req.csrfToken(), });
      return null;
    })
    .catch(next)
  },
}

module.exports = handlers;
