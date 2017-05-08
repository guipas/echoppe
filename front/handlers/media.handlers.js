'use strict';

const handlers = {
  getImage (req, res) {
    const name = req.params.name;
    console.log(req.query);
    const format = req.query && req.query.format ? req.query.format : null;
    return req.shop.models.upload.getWithThumbnail(name, format)
    .then(upload => {
      console.log(`path returned : `);
      console.log(upload.thumbnail);
      return res.sendFile(upload.thumbnail, {
        // root : path.join(__dirname, `..`, `..`),
        headers : { 
          'Content-Disposition' : `inline`,
          'Content-Type' : upload.mimetype,
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
