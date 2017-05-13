'use strict';

const handlers = {
  list (req, res) {
    return req.shop.models.taxonomy.fetchAll()
    .then(taxonomies => {
      if (req.wantsJson) {
        res.json(taxonomies);
        return null;
      }
      console.log(taxonomies);
      res.render(`taxonomies/list`, {
        csrf : req.csrfToken(),
        taxonomies,
      });
      return null;

    })
  },
  save (req, res, next) {
    const operations = [];
    console.log(req.body);
    if (req.body.newTaxonomy) {
      console.log(`New taxonomy`);
      operations.push(req.shop.models.taxonomy.make(req.body.newTaxonomy));
    }
    if (req.body.terms && Object.keys(req.body.terms).length > 0) {
      console.log(`new terms`);
      operations.push(req.shop.models.taxonomy.modifyTerms(req.body.terms));
    }
    return Promise.all(operations)
    .then(() => {
      if (req.wantsJson) {
        res.json({ message : `success` });
        return null;
      }
      res.redirect(`/admin/taxonomies`);
      return null;
    })
    .catch(next);
  },
}

module.exports = handlers;
