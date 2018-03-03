'use strict';

module.exports = (reqOrLocalsKey, res, next) => {
  if (typeof reqOrLocalsKey === 'string') {
    return (request, response, n) => {
      if (request.wantsJson) {
        console.log('json');
        return response.json(response.locals[reqOrLocalsKey]);
      }
      console.log('not json');
      return n();
    }
  }

  if (reqOrLocalsKey.wantsJson) {
    return res.json(res.locals);
  }

  return next();
};
