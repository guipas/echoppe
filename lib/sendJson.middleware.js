'use strict';

module.exports = (reqOrLocalsKey, res, next) => {
  if (typeof reqOrLocalsKey === 'string') {
    return (request, response, n) => {
      if (request.wantsJson) {
        return response.json(response.locals[reqOrLocalsKey]);
      }
      return n();
    }
  }

  if (reqOrLocalsKey.wantsJson) {
    return res.json(res.locals);
  }

  return next();
};
