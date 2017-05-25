'use strict';

const handlers = {
  showCreate (req, res, next) {
    return req.shop.models.taxonomy.fetchAll()
    .then(taxonomies => {
      return res.render(`product/create`, {
        csrf: req.csrfToken(),
        product : null,
        taxonomies,
      });
    })
    .catch(next)
  },
  create (req, res, next) {
    return req.shop.models.product.make({
      name : req.body.name,
      description : req.body.description,
      price : req.body.price,
      taxonomies : req.body.taxonomies,
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
    if (req.body.uploads) unlinkUploads = Object.keys(req.body.uploads).filter(u => req.body.uploads[u] === `on`);
    console.log(req.body);

    return req.shop.models.product.modify({
      uid : req.params.product,
      name : req.body.name,
      description : req.body.description,
      price : req.body.price,
      taxonomies : req.body.taxonomies,
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

      return product;
    })
    .then(product => req.shop.models.taxonomy.fetchAll().then(taxonomies => ({ taxonomies, product })))
    .then(({ product, taxonomies }) => {
      if (req.wantsJson) {
        res.json(product);
        return null;
      }
      // console.log(product);
      res.render(`product/create`, { product, taxonomies, csrf: req.csrfToken(), });
      return null;
    })
    .catch(next)
  },
}

module.exports = handlers;
