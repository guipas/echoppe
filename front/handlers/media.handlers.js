'use strict';

const db = require(`../../db/db`);
const path = require(`path`);

const handlers = {
  getImage (req, res) {
    const name = req.params.name;
    console.log(req.query);
    const format = req.query && req.query.format ? req.query.format : null;
    return db.models.media.getImagePath(name, format)
    .then(media => {
      console.log(`path returned : `);
      console.log(media.fileFormatPath);
      return res.sendFile(media.fileFormatPath, {
        // root : path.join(__dirname, `..`, `..`),
        headers : { 
          'Content-Disposition' : `inline`,
          'Content-Type' : media.mimetype,
        },
      });
    })
    .catch(err => {
      if (true || req.wantsJson) {
        return res.status(err.code || 500).json(err.message ? err : { message : `error` });
      }
      return res.status(err.code || 500).render(`error`, { err });
    })
  },
}

module.exports = handlers;
