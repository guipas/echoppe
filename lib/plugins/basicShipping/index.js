'use strict';

const path = require(`path`);
const globalConfig = require('../../config');
const customPluginConfig = globalConfig.plugins && globalConfig.plugins.basicshipping ? globalConfig.plugins.basicshipping : {};

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
  // options : { 
  //   countries: { label: 'Enabled countries', tip:`One country per line, format: country_code:country label`, value: ``, type: `text`, sort: 1},
  //   fees: { label: 'Shippings fees by country', tip:`one fee per line, in the form country_code:amount`, value: ``, type: `text`}
  // },
  methods: {
  },
  stepHandlers : [
    {
      step : `order:shipping`,
      name : `baseShipping:stepHandler:1`,
      priority : 1,
      label : `Ship product(s) to my home`,
      async middleware (req, res, next) {
        console.log(`### BaseShipping`);
        console.log(this);

        if (req.method === `POST`) {
          await req.shop.cartManager.fulfillStep(this.step, { handler : this.name, ...req.body });
          return next();
        }

        res.render(path.join(__dirname, `address.ejs`), {
          data : await req.shop.cartManager.getStepHandlerData(this.step, this.name),
          csrf : req.csrfToken(),
          countries : config.countries,
        });
        return;
      }
    }
  ],
}


module.exports = plugin;
