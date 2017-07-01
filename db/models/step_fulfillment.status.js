'use strict';

module.exports = {
  STEP_CANCELED : -1,
  STEP_CHOSEN : 1, // user chose the handler, but he can still decide to ditch this one and use another one, order can not be accepted
  STEP_PROCESSING : 5,
  STEP_COMPLETED : 10,
};
