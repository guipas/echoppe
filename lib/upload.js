'use strict';

const multer = require(`multer`);
const config = require(`../config`);
const path   = require(`path`);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`file destination`);
    cb(null, 'my-uploads')
  },
  filename: function (req, file, cb) {
    console.log(`filename`);
    cb(null, file.fieldname + '-' + Date.now())
  }
})

// const upload = multer({ storage })
const upload = multer({ dest: path.join(config.contentDir, `uploads`) });


module.exports = upload;

