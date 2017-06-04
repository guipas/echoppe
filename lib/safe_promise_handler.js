'use strict';


const safe = handler => (req, res, next) => {
  const x = handler(req, res, next);
  if (x instanceof Promise) {
    x.catch(next);// call error handling middleware when promise is rejected
  }
}

module.exports = safe;
