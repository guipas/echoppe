'use strict'

const app = require('./app');

app.init()
.then(() => {
  app.listen(3200, () => {
    console.log(`Example app listening on port 3200!`);
  });
})
