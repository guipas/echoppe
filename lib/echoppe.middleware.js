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


  res.locals.shop = req.shop;
  res.locals.csrf = req.csrfToken ? req.csrfToken() : null;
  res.locals.getVar = (varName, defaultValue) => {return res.locals[varName] || defaultValue };
  res.locals.linkTo = (...routes) => `${config.site.url}${path.join(`/`, ...routes)}`;
  res.locals.themePublicUrl = (...routes) =>  res.locals.linkTo(`themes`, config.theme, `public`, ...routes);
  
  const oldRedirect = res.redirect;
  res.redirect = function (...args) {
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
