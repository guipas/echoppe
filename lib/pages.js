'use strict';

const fs = require(`fs`);
const path = require(`path`);
const marked = require(`marked`);

module.exports = async function (config) {
  const pagesFiles = await new Promise((resolve, reject) => {
    fs.readdir(path.join(config.contentDir, 'pages'), (err, files) => {
      if (err) return reject(err);

      return resolve(files.filter(file => file.match(/.+\.md$/)));
    });

  });
  
  const readingPages = pagesFiles.map(file => {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(config.contentDir, `pages`, file), `utf8`, (err, content) => {
        if (err) return reject(err);

        return resolve({
          content : marked(content),
          name : file.slice(0, -3),
        })
      })
    })
  })

  const pages = await Promise.all(readingPages);

  return (req, res, next) => {
    const page = pages.find(page => page.name === req.params.page);
    if (page) {
      return res.render(`page`, page);
    }
    return next({ status : 404, message : `Page not found`});
  }
}
