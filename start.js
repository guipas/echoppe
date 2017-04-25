'use strict'

const app = require('./app');
const db  = require('./db/db');

// db.sequelize.sync({ force : true })
db.sequelize.sync()
.then(() => {
  app.listen(3200, () => {
    console.log(`Example app listening on port 3200!`);
  });
})
