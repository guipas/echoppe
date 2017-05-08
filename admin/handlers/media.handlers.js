'use strict';

const handlers = {
  list (req, res) {
    return req.shop.models.upload.fetchAll()
    .then(medias => {
      if (req.wantsJson) {
        res.json(medias);
        return null;
      }
      res.render(`media/list`, { medias });
      return null;
    })
  }
}

module.exports = handlers;
