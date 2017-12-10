'use strict';

const _ = require('lodash');
const isAdmin = require('../lib/isAdmin.auth.middleware');
const safeHandle = require(`../lib/safeHandle`);
const models = require('../lib/models');
const config = require('../lib/config');
const mediaManager = require('../lib/mediaManager');
const cartManager = require('../lib/cartManager');
const stepManager = require('../lib/stepManager');
const log       = require('../lib/debugLog').log;

const canOrder = safeHandle(async (req, res, next) => {
  if (!await cartManager.canOrder()) {
    return res.redirect('/cart');
  }

  return next();
});


module.exports = router => {

  router.get('/orders', isAdmin, safeHandle(async (req, res, next) => {
    const orders = await models.cart.orders.list();

    return res.json(orders);
  }));


  router.get('/orders/:order', isAdmin, safeHandle(async (req, res, next) => {
    const order = await models.cart.orders.fetch(req.params.order);

    return res.json(order);
  }));

  router.post('/order/choice', canOrder, safeHandle(async (req, res, next) => {
    const handlerName = req.body.choice;
    await cartManager.setStepData(cartManager.cart.currentStep, { handler : handlerName });
    return res.redirect('/order');
  }));

  router.post('/order/previous', canOrder, safeHandle(async (req, res, next) => {
    const currentStep = cartManager.cart.currentStep;
    const currentStepIndex = _.indexOf(config.orderSteps, currentStep);
    const previousStepIndex = currentStepIndex - 1;
    if (previousStepIndex >= 0) {
      const previousStep = config.orderSteps[previousStepIndex];
      await cartManager.setCurrentStep(previousStep);
    }
    return res.redirect('/order');
  }));

  router.post('/order/next', canOrder, safeHandle(async (req, res, next) => {
    const currentStep = cartManager.cart.currentStep;
    const currentStepIndex = _.indexOf(config.orderSteps, currentStep);
    const currentStepData = cartManager.cart.stepFulfillments[currentStep];
    const nextStepIndex = currentStepIndex + 1;
    if (currentStepData && currentStepData.state === 'complete' && nextStepIndex < config.orderSteps.length) {
      const nextStep = config.orderSteps[nextStepIndex];
      await cartManager.setCurrentStep(nextStep);
    }
    return res.redirect('/order').end();
  }));

  router.get('/order/cancel', safeHandle(async (req, res, next) => {
    await cartManager.destroy();
    res.redirect('/cart');
  }))

  router.all(`/order`, canOrder, safeHandle(async (req, res, next) => {

    const currentStep = cartManager.cart.currentStep;
    log('[order] current step : ', currentStep);
    if (!currentStep) {
      log('[order] going to next step');
      const nextStepName = config.orderSteps.find(stepName => !cartManager.cart.stepFulfillments || !cartManager.cart.stepFulfillments[stepName]);
      if (!nextStepName) {
        // finished
        log('[order] order finished');
        cartManager.complete();
        return res.render('order-thank-you');
      }
      await cartManager.setCurrentStep(nextStepName);
      res.redirect('/order');
      return null;
    }
    // check if current handler
    const currentHandlerData = cartManager.cart.stepFulfillments && cartManager.cart.stepFulfillments[currentStep];
    log('[order] current handler data : ', currentHandlerData ? 'present' : 'not present');
    if (currentHandlerData) {
      const currentHandler = stepManager.getHandler(currentHandlerData.handlerName);
      if (!currentHandler) { return next(new Error('Step Handler not found')) }

      return await currentHandler.middleware(req, res, async err => {
        if (err) { return next(err); }
        log(`[order] step fulffilled by plugin, redirecting...`);
        await cartManager.clearCurrentStep();
        return res.redirect('/order');
      });
    }

    // if not, make user choose handler
    const handlers = stepManager.getPossibleHandlers(currentStep);
    res.render('order-choose-handler', { handlers, csrf : req.csrfToken() });
  }));
}
