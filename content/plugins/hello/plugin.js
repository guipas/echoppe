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
      name : 'front:views:hooks:index',
      order: 1,
      handler : () => `hello from plugin !`,
    }
  ],
  events : [],
  steps : [
    { name : `order:payment`, sort : 1000 },
  ],
  stepHandlers : [
    {
      step : `order:payment`,
      name : `hello:stepHandler:1`,
      sort : 1,
      label : `pay with magic money`,
      middleware : (req, res, next) => {
        console.log(`### MIDDLEWARE PLUGIN`);
        req.echoppe.db.models.cart.fulfillStep(req.cart.uid, req.cart.currentStep.name, req.cart.currentHandler.name)
        .then(() => {
          next();
        })
      }
    }
  ],
}


module.exports = plugin;
