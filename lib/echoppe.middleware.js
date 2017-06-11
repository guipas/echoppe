'use strict';

const db = require(`../db/db`);
const mediaManager = require(`./media_manager`);
const config = require(`../config`);
const pluginManager = require(`./plugin_manager`);
const safe = require(`./safe_promise_handler`);

const loadCart = req => {
  if (req.session && req.session.cartUid) {
    console.log(`### loading cart from session...`);
    return db.models.cart.fetchOne(req.session.cartUid)
  }
  return Promise.resolve(null);
}

const getCurrencySymbol = code => {
  const currency = config.currencies.find(c => c.code === code);
  if (currency) return currency.char;
  return ``;
}

// const asyncMiddleware = (req, res, next) => {
//   return loadCart(req)
//   .then(cart => {
//     req.shop = Object.assign({}, db, {
//       current : { cart },
//       mediaManager,
//       pluginManager,
//       helpers : { getCurrencySymbol },
//     });
//     res.newRender = function newRender (...args) {
//       if (args[1] && typeof args[1] === `object` && !args[1].shop) {
//         args[1].shop = req.shop;
//       }
//       this.oldRender(...args)
//     };
//     res.oldRender = res.render;
//     res.render = res.newRender;
//     next();
//     return null;
//   })
// }


const asyncMiddleware = async function (req, res, next) {

  // fetching current cart...
  const cart = await loadCart(req);
  // fetching basic site options...
  const options = await db.models.option.getOptionsByGroup(`shop_options`);

  // building shop object
  req.shop = Object.assign({}, db, {
    current : { cart },
    mediaManager,
    pluginManager,
    options,
    helpers : { getCurrencySymbol },
  });


  // overriding render function
  res.newRender = function newRender (...args) {
    if (args[1] && typeof args[1] === `object` && !args[1].shop) {
      args[1].shop = req.shop;
    }
    this.oldRender(...args)
  };
  res.oldRender = res.render;
  res.render = res.newRender;
  next();
  return null;
}

const middleware = safe(asyncMiddleware);


module.exports = middleware;
