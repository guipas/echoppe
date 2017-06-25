'use strict';

const plugin = {
  name : `hello`,
  title : `Hello Plugin`,
  description : `the most basic example of a plugin`,
  options : {},
  init () {
  },
  hooks : [
    // 'front:views:hooks:index' : () => `hello from plugin !`,
    {
      name : 'front:views:head',
      order: 1,
      handler : () => `hello from plugin !`,
    }
  ],
  events : [],
  steps : [
    { name : `order:payment`, sort : 1000, activatedByDefault : true },
  ],
  stepHandlers : [
    {
      step : `order:payment`,
      name : `hello:stepHandler:1`,
      activatedByDefault : true,
      priority : 1,
      label : `pay with magic money`,
      middleware : (req, res, next) => {
        console.log(`### MIDDLEWARE PLUGIN`);
        return req.shop.models.cart.fulfillStep(req.shop.current.cart.uid, req.shop.current.step.name, req.shop.current.stepHandler.name)
        .then(() => {
          next();
        })
      }
    }
  ],
}


module.exports = plugin;
