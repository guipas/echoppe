'use strict';

const path = require('path');
const isAdmin = require('../lib/isAdmin.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');
const mediaManager = require('../lib/mediaManager');


module.exports = router => {
  router.get('/medias/:media', safeHandle(async (req, res) => {
    const media = await models.upload.fetch(req.params.media);
    res.set('Content-Type', media.type);
    res.sendFile(path.join(config.contentDir, 'uploads', media.filename));
  }));

  router.get('/medias/:media/thumbnail', safeHandle(async (req, res) => {
    const media        = await models.media.fetch(req.params.media);
    const thumbnailPath = await mediaManager.getThumbnail(media.filename, req.query.format);
    res.set('Content-Type', media.type);
    res.sendFile(thumbnailPath);
  }));

  router.delete('/medias/:media', isAdmin, safeHandle(async (req, res) => {
    await models.media.destroy(req.params.media);
    res.end();
  }));
}
