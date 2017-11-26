const mongoist = require('mongoist');
console.log('connecting to ', process.env.MONGODB_URI);
const db = mongoist(process.env.MONGODB_URI);

module.exports = db;
