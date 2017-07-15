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

    const settingsArray = Object.keys(plugin.settings).map(key => {
      const setting = plugin.settings[key];
      setting.name = key;
      return setting;
    })
    .sort((s1, s2) => {
      const a1 = s1.sort || 10000;
      const a2 = s2.sort || 10000;
      return a1 - a2;
    })
    console.log(settingsArray);
    const alerts = plugin.alerts && plugin.alerts.settingsPage ? [].concat(plugin.alerts.settingsPage()) : [];
    return res.render(`plugins/settings`, { plugin, alerts });
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
