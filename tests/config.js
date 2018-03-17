'use strict';

const path = require('path');

const adminUser = 'admin';
const adminPassword = '75f6a3399491121c';
const port = 3011;

module.exports = {
  app : {
    env : 'test',
    debugLog : false,
    requestLog : 'dev',
    port,
    url :  `http://localhost:${port}/test/`,
    contentDir : path.join(__dirname, 'content'),
    mongodbURI : `mongodb://localhost:27017/echoppetest`,
    sessionUseStore : false,
    adminHash : '$2a$10$mDlMToHYMK2pbjVdReBdveHCqaCGLpUu/GrBy9RK707VNQQ2dh7H6', // 75f6a3399491121c
  },
  adminPassword,
  adminUser,
};
