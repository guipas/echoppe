'use strict';

const db = require(`../../db/db`);
const pluginManager = require(`../../lib/plugins`);

const handlers = {
  order (req, res, next) {
    return new Promise((resolve, reject) => {
      if (req.session.cartUid) {
        return resolve(req.session.cartUid);
      }
      console.log(`no cart in session`);
      return reject({ code : 403, error : `no cart in session` });
    })
    .then(uid => db.models.cart.fetchOne(uid))
    .then(cart => {
      if (!cart) return Promise.reject(`no cart in session ! `);
      
      const steps = pluginManager.getActiveSteps();
      console.log(req.method);
      console.log(cart.stepFulfillments);
      console.log(steps);
      if (!cart.stepFulfillments || cart.stepFulfillments.length < 1) {
       
      }

      const currentStep = steps.find(step => {
        const fulfillment = cart.stepFulfillments.find(f => f.step.name === step.name && f.status > 0);
        return !fulfillment;
      })
      console.log(`### current step :`);
      console.log(currentStep);
      if (req.method === `POST`) {
        if (req.body.order_action === `choose`) {
          const choice = req.body.choice;
          console.log(`choice : ${choice}`);
          req.fulfill = (infos, status = 5) => {
            
          }
          res.redirect(`/order`);
        }
      } else if (req.method === `GET`) {
        console.log(`get order print next step`);
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
