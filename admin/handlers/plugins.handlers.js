'use strict';

const db = require(`../../db/db`);
const pluginManager = require(`../../lib/plugins`);

const handlers = {
  list (req, res) {
    return db.models.option.fetchValue(`core:activated_plugins`)
    .then(activatedPlugins => {
      const plugins = pluginManager.plugins.map(plugin => {
        let isActive = false;
        if (activatedPlugins) {
          const pluginInfo = activatedPlugins.find(p => p.name === plugin.name)
          if (pluginInfo && pluginInfo.activated) isActive = true;
        }
        return {
          name : plugin.name,
          title : plugin.title,
          label : plugin.label,
          description : plugin.description,
          isActive,
        }
      });
      if (req.wantsJson) {
        return res.send(plugins);
      }
      return res.render(`plugins/list`, { plugins, csrf : req.csrfToken() });

    })
  },
  triggerActivation (req, res) {
    const name = req.params.plugin;
    return db.models.option.fetchValue(`core:activated_plugins`)
    .then(activatedPlugins => {
      if (!activatedPlugins) activatedPlugins = [];

      const pluginInfo = activatedPlugins.find(p => p.name === name);
      if (pluginInfo) { pluginInfo.activated = !pluginInfo.activated }
      else activatedPlugins.push({ name, activated : true })

      return db.models.option.setValue(`core:activated_plugins`, activatedPlugins);
    })
    .then(() => {
      res.redirect(res.app.locals.linkTo(`/plugins`));
      return null;
    })
  },
}

module.exports = handlers;
