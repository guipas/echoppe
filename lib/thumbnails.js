'use strict';

const fs        = require(`fs`);
const path      = require(`path`);
const sharp     = require(`sharp`);
const config    = require(`../config.js`);
const mkdirp      = require('mkdirp');


const getThumbnail = (filename, format) => {

  const fileOriginalPath = path.join(config.contentDir, `uploads`, filename);
  if (!format) return Promise.resolve(fileOriginalPath);

  const formatObject = config.thumbnailsFormats.find(f => f.name === format);
  if (!formatObject) return Promise.reject(`format does not exists`);

  const fileFormatPath  = path.join(config.contentDir, `thumbnails`, format, filename);

  console.log(`Getting thumbnail in format : ${format}`);

  return new Promise((resolve, reject) => {
    fs.access(fileFormatPath, fs.constants.F_OK, err => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(fileFormatPath);
    })
  })
  .catch(() => {
    console.log(`generating thumbnail...`);

    return new Promise((resolve, reject) => {
      mkdirp(path.dirname(fileFormatPath), err => {
        if (err) reject({ code : 500, error : `Error generating thumbnail dir` })
        console.log(`created directory`);
        return sharp(fileOriginalPath)
        .resize(...formatObject.transform.resize)
        .toFile(fileFormatPath)
        .then(info => {
          // console.log(info);
          console.log(`thumbnail generated`);
          return resolve(fileFormatPath);
        })
        .catch(err => {
          console.log(err);
          return reject({ code : 500, error : `Error generating thumbnail` });
        })
      })
    });
  });
}

module.exports = getThumbnail;
