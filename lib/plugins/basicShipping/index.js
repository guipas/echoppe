'use strict';

const path = require(`path`);
const globalConfig = require('../../config');
const customPluginConfig = globalConfig.plugins && globalConfig.plugins.basicshipping ? globalConfig.plugins.basicshipping : {};

const config = {
  countries : [
    { label : 'United States of America', code : 'US' },
  ],
  ...customPluginConfig,
};

const plugin = {
  name : `basicshipping`,
  title : `Addresses & Shpping`,
  description : `Basic Addresses and Shipping Plugin`,
  stepHandlers : [
    {
      step : `order:shipping`,
      name : `baseShipping:stepHandler:1`,
      priority : 1,
      label : `Ship product(s) to my home`,
      async middleware (req, res, next) {
        const cart = await req.shop.getCurrentCart();
        if (req.method === `POST`) {
          await cart.fulfillStep(this.step, { handler : this.name, address : req.body });
          return next();
        }

        return res.renderAsBody(path.join(__dirname, `address.ejs`), {
          data : await cart.getStepHandlerData(this.step, this.name),
          csrf : req.csrfToken(),
          countries : config.countries,
        });
      },
    },
  ],
};


module.exports = plugin;
