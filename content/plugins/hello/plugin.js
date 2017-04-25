'use strict';

const plugin = {
  name : `hello`,
  description : `the most basic example of a plugin`,
  options : {},
  init () {
  },
  hooks : {
    'front:views:hooks:index' : () => `hello from plugin !`,
  },
  events : {},
}


module.exports = plugin;
