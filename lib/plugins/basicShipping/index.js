'use strict';

const path = require(`path`);
const globalConfig = require('../../config');
const customPluginConfig = globalConfig.plugins && globalConfig.plugins.basicshipping ? globalConfig.plugins.basicshipping : {};
const demandManager = require('../../demandManager');

const config = {
  countries : [
    { label : 'United States of America', code : 'US' },
  ],
  fees : {
    'US' : 0,
  },
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

        // res.render(path.join(__dirname, `address.ejs`), {
        //   data : await cart.getStepHandlerData(this.step, this.name),
        //   csrf : req.csrfToken(),
        //   countries : config.countries,
        // });
        const result = await demandManager.demand('theme:renderFileAsBody', {
          file : path.join(__dirname, `address.ejs`),
          locals : {
            ...res.locals,
            data : await cart.getStepHandlerData(this.step, this.name),
            csrf : req.csrfToken(),
            countries : config.countries,
          }
        })

        console.log('=====', result);
        return res.send(result.content);
      }
    }
  ],
}


module.exports = plugin;
