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
      // console.log(req.method);
      // console.log(cart.stepFulfillments);
      // console.log(steps);
      console.log(`###data in sessions: `);
      console.log(req.session.cartCurrentStepName);
      console.log(req.session.cartCurrentStepHandlerName);

      // loading current step from session...
      let currentStep = steps.find(step => step.name === req.session.cartCurrentStepName)
      if (!currentStep) {
        // current step is the next step in the order process that is not fulfilled yet
        currentStep = steps.find(step => {
          const fulfillment = cart.stepFulfillments.find(f => f.step.name === step.name && f.status >= 0);
          return !fulfillment;
        })
      }

      // loading current handler...
      let currentStepHanlder = null;
      if (currentStep && req.session.cartCurrentStepHandlerName) {
        currentStepHanlder = currentStep.handlers.find(handler => handler.name === req.session.cartCurrentStepHandlerName);
      }

      console.log(`### current step :`);
      console.log(currentStep);
      console.log(`### current handler :`);
      console.log(currentStepHanlder);

      // no current step, maybe the order is completed ? (or there is something wrong)
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

      // coming back from the page that allow customer to choose step hanlder
      // e.g. : paypal or credit card ?
      if (req.method === `POST` && req.body.order_action === `choose`) {
          const choice = req.body.choice;
          // saving chosen handler...
          req.session.cartCurrentStepName = currentStep.name;
          req.session.cartCurrentStepHandlerName = currentStep.handlers.find(handler => handler.name === choice).name;
          res.redirect(`/order`);
          return null;
      } else {
        if (currentStepHanlder) {
          // an handler is currently holding control of order process
          try {
            req.shop.current.step = currentStep;
            req.shop.current.stepHandler = currentStepHanlder;
            const result = currentStepHanlder.middleware(req, res, e => {
              if (e) throw e;
              console.log(`### SUCCESS`);
              // when plugin's middleware has succeded, it calls this callback
              req.session.cartCurrentStepName = null;
              req.session.cartCurrentStepHandlerName = null;
              res.redirect(`/order`);
              return null;
            })
            if (result && typeof result.then === `function`) {
              return result;
            }
          } catch (err) {
            console.log(err);
            return Promise.reject({ message : `Problem with plugin : ${req.shop.current.stepHandler.plugin}` })
          }
        } else {
          // no handler chosen for current step
          console.log(`### printing choice for current step`);
          if (currentStep.handlers.length === 0) {
            // error
            next({ status : 500, message : `Error in order configuration, no handler for this step` });

            return null;
          } else if (currentStep.handlers.length === 1) {
            console.log(`just one handlder`);
            // just one handler, auto select the only one there is...
            req.session.cartCurrentStepName = currentStep.name;
            req.session.cartCurrentStepHandlerName = currentStep.handlers[0].name;
            res.redirect(`/order`);
            return null;
          }
          res.render(`order/choose`, {
            csrf : req.csrfToken(),
            handlers : currentStep.handlers,
            currentStepName : currentStep.name,
          });
        }
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
