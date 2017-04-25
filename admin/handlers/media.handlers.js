'use strict';

const db = require(`../../db/db`);

const handlers = {
  list (req, res) {
    return db.models.media.find()
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
