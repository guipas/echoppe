'use strict';

const path = require(`path`);
const globalConfig = require('../../config');
const customPluginConfig = globalConfig.plugins && globalConfig.plugins.basicStripe ? globalConfig.plugins.basicStripe : {};

const config = {
  keySecret : process.env.ECHOPPE_STRIPE_SECRET_KEY || null,
  keyPublishable : process.env.ECHOPPE_STRIPE_PUBLISHABLE_KEY || null,
  ...customPluginConfig,
};

let stripe = null;
if (config.keyPublishable && config.keySecret) {
  stripe = require("stripe")(config.keySecret);
}

const plugin = {
  name : `stripe`,
  title : `Stripe payment integration (unofficial)`,
  description : `Enable payment with stripe`,
  stepHandlers : [
    {
      step : `order:payment`,
      name : `basicStripe:stepHandler:payment`,
      priority : 1,
      activatedByDefault : true,
      label : `Pay width debit/credit card (stripe)`,
      async middleware (req, res, next) {
        if (!stripe) {
          console.log(`keyPublishable and/or keySecret not configured`);
          return next(new Error(`keyPublishable and/or keySecret not configured`));
        }

        const currentCart = await req.shop.getCurrentCart();

        if (req.method === `POST` && req.body.plugin_action === `validate_payment`) {
          let amount = null;

          return currentCart.checkQuantities()
          .then(errors => {
            if (errors.length > 0) {
              return Promise.reject('Some products in the cart are not available anymore');
            }
          })
          .then(() => currentCart.getTotal())
          .then(total => amount = total * 100) // stripe require amount in cents
          .then(() => stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
          }))
          .then(customer => stripe.charges.create({
              amount,
              description: "Sample Charge",
                currency: globalConfig.currency.code,
                customer: customer.id
          }))
          .then(charge => {
            return currentCart.fulfillStep(this.step, { handler : this.name, charge })
          })
          .then(() => {
            next();
            return;
          })
          .catch(e => {
            console.log(e);
            res.status(500).render(path.join(__dirname, `error.ejs`), { error : e.message });
            return;
          })
        }

        const email = await currentCart.getEmail();
        return currentCart.getTotal()
        .then(total => {
          res.render(path.join(__dirname, `payment.ejs`), {
            keyPublishable: config.keyPublishable,
            total : total * 100,
            csrf : req.csrfToken(),
            cart : currentCart,
            email,
          });
          return null;
        })
      }
    }
  ],
}

module.exports = plugin;
