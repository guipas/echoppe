'use strict';

const path = require(`path`);

// const keyPublishable = process.env.PUBLISHABLE_KEY;
const keyPublishable = `pk_test_3dt3dTXVME1yLzZQPctBtV1S`;
// const keySecret = process.env.SECRET_KEY;
const keySecret = `sk_test_0poc1Q6Xa4z8svfECCNOiyP2`;

const stripe = require(`stripe`)(keySecret);

const plugin = {
  name : `stripe`,
  title : `Stripe payment integration (unofficial)`,
  description : `Enable payment with stripe`,
  options : {},
  init () {
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
        console.log(`### Stripe`);
        if (req.method === `POST` && req.body.plugin_action === `validate_payment`) {
          let amount = 100;

          return stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
          })
          .then(customer => stripe.charges.create({
              amount,
              description: "Sample Charge",
                currency: "eur",
                customer: customer.id
          }))
          .then(charge => {
            console.log(`### charge`);
            console.log(charge);
            return req.shop.models.cart.fulfillStep(req.shop.current.cart.uid, req.shop.current.step.name, req.shop.current.stepHandler.name)
          })
          .then(() => {
            next();
            return;
          })
          .catch(e => {
            res.status(e.statusCode).render(path.join(__dirname, `payment.ejs`), { error : e.message, keyPublishable });
            return;
          })
        }
        console.log(req.shop.current.cart);
        res.render(path.join(__dirname, `payment.ejs`), { keyPublishable });
      }
    }
  ],
}


module.exports = plugin;
