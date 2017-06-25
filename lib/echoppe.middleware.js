'use strict';

const db = require(`../db/db`);
const mediaManager = require(`./media_manager`);
const config = require(`../config`);
const pluginManager = require(`./plugin_manager`);
const safe = require(`./safe_promise_handler`);
const path = require(`path`);

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

const asyncMiddleware = async function (req, res, next) {

  // fetching current cart...
  const cart = await loadCart(req);
  // fetching basic site options...
  const options = await db.models.option.getOptionsByGroup(`shop_options`);

  const theme = {};
  theme.path = path.join(config.contentDir, `themes`, config.theme);
  theme.headerPath = path.join(theme.path, `partials`, `header.ejs`);
  theme.footerPath = path.join(theme.path, `partials`, `footer.ejs`);


  // building shop object
  req.shop = Object.assign({}, db, {
    current : { cart, user : req.user },
    config,
    theme,
    mediaManager,
    pluginManager,
    options,
    helpers : { getCurrencySymbol },
  });


  // overriding render function
  const oldRender = res.render;
  res.render = function (...args) {
    const viewData = {
      shop : req.shop,
      csrf : req.csrfToken ? req.csrfToken() : null,
      getVar : (varName, defaultValue) => { return args[1][varName] || defaultValue },
    }
    if (args[1] && typeof args[1] === `object`) {
      Object.assign(args[1], viewData);
    } else if (args.length === 1) {
      args.push(viewData);
    }
    Reflect.apply(oldRender, this, args);
  }
  
  const oldRedirect = res.redirect;
  res.redirect = function (...args) {
    console.log(`@@@@@@@@@@new redirect`);
    if (req.session) {
      req.session.save(err => {
        Reflect.apply(oldRedirect, this, args);
      })
    } else {
      Reflect.apply(oldRedirect, this, args);
    }
  }
  next();
  return null;
}

const middleware = safe(asyncMiddleware);


module.exports = middleware;
