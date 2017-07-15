'use strict';

const path = require(`path`);

const plugin = {
  name : `baseshipping`,
  title : `Addresses & Shpping`,
  description : `Basic Addresses and Shipping Plugin`,
  settings : { 
    countries: { label: 'Enabled countries', tip:`One country per line, format: country_code:country label`, value: ``, type: `text`, sort: 1},
    fees: { label: 'Shippings fees by country', tip:`one fee per line, in the form country_code:amount`, value: ``, type: `text`}
  },
  custom: {
    getCoutries() {
      const lines = plugin.settings.countries.value.split(/\r?\n/);
      const countries = lines.map(l => l.split(':')).map(c => ({ code: c[0], label: c[1] }));
      return countries;
    },
    getShippingFees() {
      const lines = plugin.settings.fees.value.split(/\r?\n/);
      const fees = lines.map(l => l.split(':')).map(c => ({ code: c[0], amount: parseFloat(c[1]) }));

      return fees;
    },
    getFeeForCountry(code) {
      const fees = plugin.custom.getShippingFees();
      const fee = fees.find(f => f.code === code);
      let amount = 0;

      if (fee && fee.amount) {
        amount = fee.amount;
      }

      return amount;
    }
  },
  ready () {
    plugin.custom.getShippingFees();
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

            const fee = plugin.custom.getFeeForCountry(req.body.address.country);

            await req.shop.models.cart.setShippingAddress(req.shop.current.cart.uid, address.uid);
            await req.shop.models.cart.fulfillStep(req.shop.current.cart.uid, req.shop.current.step.name, req.shop.current.stepHandler.name, {}, req.shop.status.stepFulfillment.STEP_COMPLETED, fee);

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
          address : req.shop.current.cart.shipping_address,
          countries: plugin.custom.getCoutries(),
        });
        return;
      }
    }
  ],
}


module.exports = plugin;
