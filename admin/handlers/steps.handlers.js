'use strict';

const handlers = {
  list (req, res) {
    res.render(`steps/list`, {
      csrf : req.csrfToken(),
      steps : req.shop.pluginManager.steps,
    });
  },
  triggerActivation (req, res) {
    const stepName = req.params.step;
    return req.shop.pluginManager.triggerStepActivation(stepName)
    .then(() => {
      res.redirect(res.app.locals.linkTo(`/steps`));
      return null;
    })
  }

}

module.exports = handlers;
