'use strict';

const db = require(`../../db/db`);

const getCurrents = req => {
  return new Promise((resolve, reject) => {
    if (req.shop.current.cart) {
      return resolve(req.shop.current.cart);
    }
    return reject({ status : 403, message : `no cart in session` });
  })
  .then(cart => {
    const steps = req.shop.pluginManager.getActiveSteps();

    // loading current step from cart...
    let currentStep = steps.find(step => step.name === cart.currentStep)
    let currentStepFulfillment = null;
    if (currentStep) {
      currentStepFulfillment = cart.stepFulfillments.find(f => f.step.name === currentStep.name && f.status >= 0);
    } else {
      // current step is the next step in the order process that is not fulfilled yet
      currentStep = steps.find(step => {
        const fulfillment = cart.stepFulfillments.find(f => f.step.name === step.name && f.status >= 0);
        return !fulfillment;
      })
    }

    let currentStepIndex = null;
    if (currentStep) { currentStepIndex = steps.findIndex(step => step.name === currentStep.name); }

    // loading current handler...
    let currentStepHanlder = null;
    if (currentStep && cart.currentStepHandler) {
      currentStepHanlder = currentStep.handlers.find(handler => handler.name === cart.currentStepHandler);
    }


    console.log(`### current step :`);
    console.log(currentStep);
    console.log(`### current handler :`);
    console.log(currentStepHanlder);
    console.log(`### current step fulfillment :`);
    console.log(currentStepFulfillment);

    return { currentStepIndex, steps, cart, currentStep, currentStepFulfillment, currentStepHanlder }
  })
}

const handlers = {
  previousStep (req, res, next) {
    return getCurrents(req)
    .then(({ steps, cart, currentStep, currentStepIndex, currentStepHanlder }) => {
      if (currentStepHanlder && currentStep.handlers.length > 1) {
        return req.shop.models.cart.modify(cart.uid, { currentStepHandler : null })
        .then(() => {
          res.redirect(`/order`);
          return null;
        })
      }

      if (currentStepIndex - 1 >= 0) {
        const previousStep = steps[currentStepIndex - 1];
        return req.shop.models.cart.modify(cart.uid, { currentStep : previousStep.name })
        .then(() => {
          res.redirect(`/order`);
          return null;
        })
      }

      res.redirect(`/cart`);
      return null;
    })
  },
  chooseHandler (req, res, next) {
    return getCurrents(req)
    .then(({ cart, currentStep }) => {
      // coming back from the page that allow customer to choose step hanlder
      // e.g. : paypal or credit card ?
      const choice = req.body.choice;
      // saving chosen handler...
      return req.shop.models.cart.modify(cart.uid, {
        currentStep : currentStep.name,
        currentStepHandler : currentStep.handlers.find(handler => handler.name === choice).name,
      })
      .then(() => {
        res.redirect(`/order`);
        return null;
      })
    })
  },
  order (req, res, next) {
    return getCurrents(req)
    .then(({ cart, currentStep, steps, currentStepHanlder, currentStepIndex }) => {

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

      if (currentStepHanlder) {
        // an handler is currently holding control of order process
        req.shop.current.step = currentStep;
        req.shop.current.stepHandler = currentStepHanlder;
        res.locals.canGoBack = currentStepIndex >= 0;
        res.locals.canGoForward = false;
        if (currentStepIndex < steps.length - 1) {
          const nextStep = steps[currentStepIndex + 1];
          const nextFulfillment = cart.stepFulfillments.find(f => f.step.name === nextStep.name);
          if (nextFulfillment) { res.locals.canGoForward = true; }
        }
        res.locals.previousLink = res.locals.linkTo(`order`, `previous`);
        res.locals.nextLink = res.locals.linkTo(`order`, `next`);
        res.locals.theme.layout = res.locals.theme.layouts.NAKED; // simple layout without menu

        return new Promise((resolve, reject) => {
          const result = currentStepHanlder.middleware(req, res, e => {
            // when plugin's middleware has succeded, it calls this callback
            if (e) return reject(e);
            console.log(`### SUCCESS`);
            return resolve();
          })
          if (result && typeof result.catch === `function`) {
            result.catch(e => reject(e));
          }
        })
        .then(() => req.shop.models.cart.modify(cart.uid, {
          currentStep : null,
          currentStepHandler : null,
        }))
        .then(() => {
          res.redirect(`/order`);
          return null;
        })
        .catch(e => {
          console.log(e);
          return Promise.reject({ message : `Problem with plugin : ${currentStepHanlder.plugin}` })
        })
      }

      // no handler chosen for current step
      console.log(`### printing choice for current step`);
      if (currentStep.handlers.length === 0) {
        // error
        next({ status : 500, message : `Error in order configuration, no handler for this step` });

        return null;
      } else if (currentStep.handlers.length === 1) {
        console.log(`just one handlder`);
        // just one handler, auto select the only one there is...
        return req.shop.models.cart.modify(cart.uid, {
          currentStep : currentStep.name,
          currentStepHandler : currentStep.handlers[0].name,
        })
        .then(() => {
          res.redirect(`/order`);
          return null;
        })
      }
      res.render(`order/choose`, {
        csrf : req.csrfToken(),
        handlers : currentStep.handlers,
        currentStepName : currentStep.name,
      });

      return null;
    })
    .catch(err => {
      next(err);
      return null;
    })
  },
}

module.exports = handlers;
