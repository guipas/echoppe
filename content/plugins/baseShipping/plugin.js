'use strict';

const path = require(`path`);

const plugin = {
  name : `hello`,
  title : `Hello Plugin`,
  description : `the most basic example of a plugin`,
  options : {},
  init () {
  },
  hooks : [
  ],
  events : [],
  steps : [
    { name : `order:shipment`, sort : 10, activatedByDefault : true },
  ],
  stepHandlers : [
    {
      step : `order:shipment`,
      name : `baseShipping:stepHandler:1`,
      priority : 1,
      activatedByDefault : true,
      label : `Ship product(s) to my home`,
      middleware : (req, res, next) => {
        console.log(`### BaseShipping`);
        // return req.shop.models.cart.fulfillStep(req.shop.current.cart.uid, req.shop.current.cart.currentStep.name, req.shop.current.cart.currentHandler.name)
        // .then(() => {
        //   next();
        // })
        if (req.shop.current.user) {
          return res.render(path.join(__dirname, `choose_address.ejs`));
        }
        if (req.method === `POST` && req.body.plugin_action === `validate_address`) {
          // return req.shop.models.user.fetchByEmail(req.body.email)
          // .then(user => { if (user) return Promise.reject({ status : 401, message : `An account is already registered with this email` }) })
          // .then(() => req.shop.models.user.make({ email : req.body.email }))
          // .then(user => {
          //   return req.shop.models.address.make(req.body.address, user);
          // })
          return Promise.resolve()
          .then(() => {
            return req.shop.models.address.make(req.body.address);
          })
          .then(address => {
            return req.shop.models.cart.setShippingAddress(req.shop.current.cart.uid, address.uid);
          })
          .then(() => req.shop.models.cart.fulfillStep(req.shop.current.cart.uid, req.shop.current.step.name, req.shop.current.stepHandler.name))
          .then(() => {
            next();
            return;
          })
        }
        res.render(path.join(__dirname, `address.ejs`));
      }
    }
  ],
}


module.exports = plugin;
