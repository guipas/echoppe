'use strict';

const path = require('path');

const adminUser = 'admin';
const adminPassword = '75f6a3399491121c';

module.exports = ({ port }) => ({
  app : {
    env : 'test',
    debugLog : true,
    requestLog : 'dev',
    url :  `http://localhost:${port}/test`,
    contentDir : path.join(__dirname, 'content'),
    mongodbURI : process.env.ECHOPPE_TEST_MONGODBURI,
    sessionUseStore : false,
    adminHash : '$2a$10$mDlMToHYMK2pbjVdReBdveHCqaCGLpUu/GrBy9RK707VNQQ2dh7H6', // 75f6a3399491121c
  },
  adminPassword,
  adminUser,
});
