'use strict';

const db = require(`../../db/db`);

const handlers = {
  order (req, res, next) {
    console.log(`### begin order process...`);
    return new Promise((resolve, reject) => {
      if (req.shop.current.cart) {
        return resolve(req.shop.current.cart);
      }
      console.log(`no cart in session`);
      return reject({ status : 403, message : `no cart in session` });
    })
    // .then(uid => db.models.cart.fetchOne(uid))
    .then(cart => {
      const steps = req.shop.pluginManager.getActiveSteps();
      console.log(req.method);
      console.log(cart.stepFulfillments);
      console.log(steps);

      const currentStep = steps.find(step => {
        const fulfillment = cart.stepFulfillments.find(f => f.step.name === step.name && f.status >= 0);
        return !fulfillment;
      })
      console.log(`### current step :`);
      console.log(currentStep);
      if (!currentStep) {
        console.log(`no current step, order completed ?`);
        return db.models.cart.updateStatus(cart.uid)
        .then(cart => {
          console.log(`status updated`);
          console.log(cart);
          // req.cart = cart;
          if (cart.status >= 5) {
            req.session.cartUid = null;
            res.render(`order/success`);
            return null;
          }
          res.render(`order/error`);
          return null;
        })
      }
      if (req.method === `POST`) {
        if (req.body.order_action === `choose`) {
          const choice = req.body.choice;
          req.shop.current.cart.currentStep = currentStep;
          req.shop.current.cart.currentHandler = currentStep.handlers.find(handler => handler.name === choice);

          try {
            req.shop.current.cart.currentHandler.middleware(req, res, () => {
              res.redirect(`/order`);
            })
          } catch (err) {
            console.log(err);
            return Promise.reject({ message : `Problem with plugin : ${req.shop.current.cart.currentHandler.plugin}` })
          }
          console.log(`choice : ${choice}`);

          
        }
      } else if (req.method === `GET`) {
        console.log(`### printing choice for current step`);
         res.render(`order/choose`, {
          csrf : req.csrfToken(),
          handlers : steps[0].handlers,
          currentStepName : currentStep.name,
        });
        return null;
      }
    })
    .catch(err => {
      next(err);
      return null;
    })
  },
}

module.exports = handlers;
