'use strict';

const path = require('path');
const isAdmin = require('../lib/isAdmin.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');
const mediaManager = require('../lib/mediaManager');


module.exports = router => {
  router.get('/uploads/:upload', safeHandle(async (req, res) => {
    const upload = await models.upload.fetch(req.params.upload);
    res.set('Content-Type', upload.type);
    res.sendFile(path.join(config.contentDir, 'uploads', upload.filename));
  }));

  router.get('/uploads/:upload/thumbnail', safeHandle(async (req, res) => {
    const upload        = await models.upload.fetch(req.params.upload);
    const thumbnailPath = await mediaManager.getThumbnail(upload.filename, req.query.format);
    res.set('Content-Type', upload.type);
    res.sendFile(thumbnailPath);
  }));

  router.delete('/uploads/:upload', isAdmin, safeHandle(async (req, res) => {
    await models.upload.destroy(req.params.upload);
    res.end();
  }));
}
