'use strict';

const db = require(`../../db/db`);
const pluginManager = require(`../../lib/plugins`);

const handlers = {
  list (req, res) {
    res.render(`steps/list`, {
      csrf : req.csrfToken(),
      steps : pluginManager.steps,
    });
  },
  triggerActivation (req, res) {
    const stepName = req.params.step;
    return pluginManager.triggerStepActivation(stepName)
    .then(() => {
      res.redirect(res.app.locals.linkTo(`/steps`));
      return null;
    })
  }

}

module.exports = handlers;
