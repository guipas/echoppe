'use strict';

const path = require(`path`);

const plugin = {
  name : `baseshipping`,
  title : `Addresses & Shpping`,
  description : `Basic Addresses and Shipping Plugin`,
  settings : {},
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
      middleware : async function (req, res, next) {
        console.log(`### BaseShipping`);
        const user = req.shop.current.user;

        if (req.method === `POST`) {
          if (req.body.plugin_action === `validate_address`) {
            let address = await req.shop.models.address.fetchForCart(req.shop.current.cart.uid);

            if (address) { address = await req.shop.models.address.modify(address.uid, Object.assign({}, req.body.address, { user_uid : user ? user.uid : null })); }
            else         { address = await req.shop.models.address.make(Object.assign({}, req.body.address, { user_uid : user ? user.uid : null })); }

            await req.shop.models.cart.setShippingAddress(req.shop.current.cart.uid, address.uid);
            await req.shop.models.cart.fulfillStep(req.shop.current.cart.uid, req.shop.current.step.name, req.shop.current.stepHandler.name);

            next();
            return;
          } else if (req.body.plugin_action === `choose_address`) {
            let address = await req.shop.models.address.fetch(req.body.address, { userUid : req.shop.current.user.uid })
            
            if(!address) { next({ status: 401, message : `wrong address` }) }

            await req.shop.models.cart.setShippingAddress(req.shop.current.cart.uid, address.uid);
            await req.shop.models.cart.fulfillStep(req.shop.current.cart.uid, req.shop.current.step.name, req.shop.current.stepHandler.name);

            next();
            return;
          }

            
        }

        let addresses = [];
        if (req.shop.current.user) { addresses = await req.shop.models.address.fetchForUser(req.shop.current.user.uid) }

        res.render(path.join(__dirname, `address.ejs`), {
          addresses,
          address : req.shop.current.cart.shipping_address
        });
        return;
      }
    }
  ],
}


module.exports = plugin;
