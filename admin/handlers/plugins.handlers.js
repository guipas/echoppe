'use strict';

const db = require(`../../db/db`);

const handlers = {
  list (req, res) {
    const plugins = req.shop.pluginManager.plugins;
    if (req.wantsJson) {
      return res.send(plugins);
    }
    return res.render(`plugins/list`, { plugins, csrf : req.csrfToken() });

  },
  triggerActivation (req, res) {
    const name = req.params.plugin;
    return req.shop.pluginManager.togglePluginActivation(name)
    .then(() => {
      res.redirect(res.app.locals.linkTo(`/plugins`));
      return null;
    })
  },
  settings (req, res, next) {
    const plugin = req.shop.pluginManager.getByName(req.params.plugin);
    if (!plugin) return next();

    if (req.wantsJson) {
      return res.json(plugin.settings);
    }

    console.log(plugin.settings);
    return res.render(`plugins/settings`, { plugin });
  },
  saveSettings (req, res, next) {
    return req.shop.pluginManager.savePluginSettings(req.params.plugin, req.body.settings)
    .then(() => {
      if (req.wantsJson) {
        res.json({ message : `ok` });
        return null;
      }
      res.redirect(res.locals.urlToAdmin(`plugins`, req.params.plugin, `settings`));
    })
  },
}

module.exports = handlers;
