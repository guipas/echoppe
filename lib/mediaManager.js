'use strict';

const fs        = require(`fs`);
const path      = require(`path`);
const sharp     = require(`sharp`);
const config    = require(`./config.js`);
const mkdirp      = require('mkdirp');
const log       = require('./debugLog').log;


const getThumbnail = (filename, format) => {

  const fileOriginalPath = path.join(config.contentDir, `uploads`, filename);
  if (!format) return Promise.resolve(fileOriginalPath);

  const formatObject = config.thumbnailsFormats.find(f => f.name === format);
  if (!formatObject) return Promise.reject(`format does not exists`);

  const fileFormatPath  = path.join(config.contentDir, `thumbnails`, format, filename);

  log(`Getting thumbnail in format : ${format}`);

  return new Promise((resolve, reject) => {
    fs.stat(fileFormatPath, (err, stats) => {
      if (err) {
        log(err);
        return reject(err);
      }
      if (stats.size === 0) reject();
      log('thubnail found in cache');
      return resolve(fileFormatPath);
    })
  })
  .catch(() => {
    log(`generating thumbnail...`);

    return new Promise((resolve, reject) => {
      mkdirp(path.dirname(fileFormatPath), err => {
        if (err) reject({ code : 500, error : `Error generating thumbnail dir` })
        log(`created directory`);
        return sharp(fileOriginalPath)
        .resize(...formatObject.transform.resize)
        .toFile(fileFormatPath)
        .then(info => {
          // log(info);
          log(`thumbnail generated`);
          return resolve(fileFormatPath);
        })
        .catch(err => {
          log(err);
          return reject({ code : 500, error : `Error generating thumbnail` });
        })
      })
    });
  });
}

const mediaManager = {
  getThumbnail,
};

module.exports = mediaManager;
