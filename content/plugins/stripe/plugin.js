'use strict';

const path = require(`path`);

let stripe = null;

const plugin = {
  name : `stripe`,
  title : `Stripe payment integration (unofficial)`,
  description : `Enable payment with stripe`,
  settings : {
    keyPublishable : {},
    keySecret : { label: `Your stripe secret key`, tip: `You can find this information in your stripe account`, value : '' },
  },
  alerts : {
    settingsPage () {
      if (!plugin.settings.keyPublishable.value || !plugin.settings.keySecret.value) {
        return { type: `danger`, text: `keyPublishable and/or keySecret not configured` };
      }

      return [];
    }
  },
  ready ({ settings, store }) {
    stripe = require(`stripe`)(settings.keySecret.value);// eslint-disable-line
    store.setValue(`test`, `ok`);

  },
  steps : [
    { name : `order:payment`, sort : 1000, activatedByDefault : true },
  ],
  stepHandlers : [
    {
      step : `order:payment`,
      name : `stripe:stepHandler:payment`,
      priority : 1,
      activatedByDefault : true,
      label : `Pay width debit/credit card (stripe)`,
      middleware : (req, res, next) => {
        // console.log(`### Stripe`);
        if (!plugin.settings.keyPublishable.value && !plugin.settings.keySecret) {
          console.log(`keyPublishable and/or keySecret not configured`);
          return next(new Error());
        }

        if (req.method === `POST` && req.body.plugin_action === `validate_payment`) {
          let amount = null;

          return req.shop.models.cart.getTotal(req.shop.current.cart.uid, true)
          .then(total => amount = total)
          .then(() => stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
          }))
          .then(customer => stripe.charges.create({
              amount,
              description: "Sample Charge",
                currency: "eur",
                customer: customer.id
          }))
          .then(charge => {
            // console.log(`### charge`);
            // console.log(charge);
            return req.shop.models.cart.fulfillStep(req.shop.current.cart.uid, req.shop.current.step.name, req.shop.current.stepHandler.name, { charge })
          })
          .then(() => {
            next();
            return;
          })
          .catch(e => {
            res.status(e.statusCode).render(path.join(__dirname, `payment.ejs`), { error : e.message, keyPublishable: plugin.settings.keyPublishable.value });
            return;
          })
        }

        // console.log(req.shop.current.cart);
        return req.shop.models.cart.getTotal(req.shop.current.cart.uid, true)
        .then(total => {
          res.render(path.join(__dirname, `payment.ejs`), {
            keyPublishable: plugin.settings.keyPublishable.value,
            total,
          });
          return null;
        })
      }
    }
  ],
}

module.exports = plugin;
