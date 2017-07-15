'use strict';

const fs = require(`fs`);
const path = require(`path`);
const config = require(`../config`);
const express = require(`express`);
const deepmerge = require('deepmerge');

const plugins = {
  plugins : [],
  steps : {},
  _db : null,
  init (db, app) {
    this._db = db;
    return this._loadPlugins(app)
    .then(() => this._configurePlugins())
    .then(() => this._loadSteps())
  },
  getActiveSteps () {
    return this.steps.filter(step => step.activated);
  },
  url (pluginName, ...parts) {
    return `${config.site.url}/${path.join(`plugins/${pluginName}`, ...parts)}`;
  },
  getByName (pluginName) {
    return this.plugins.find(p => p.name === pluginName);
  },
  _loadPlugins (app) {
    return new Promise((resolve, reject) => {
      fs.readdir(path.join(config.contentDir, `plugins`), `utf8`, (err, files) => {
        if (err) reject(err);
        files.forEach(file => {
          const plugin = require(path.join(config.contentDir, `plugins`, file, `plugin`));// eslint-disable-line
          plugin.url = this.url(plugin.name);
          plugin.publicUrl = this.url(plugin.name, `public`);
          this.plugins.push(plugin);
          app.use(`/plugins/${plugin.name}/public`, express.static(path.join(config.contentDir, `plugins`, file, `public`)));
        })
        resolve(true);
      })
    })
  },
  _configurePlugins () {
    return this._loadPluginsActivation()
    .then(() => this._loadPluginsSettings())
    .then(() => this._loadPluginsReady())
  },
  _loadPluginsActivation () {
    return this._db.models.option.fetchValue(`core:activated_plugins`)
    .then(activatedPlugins => {
      this.plugins.forEach(plugin => {
        let isActive = false;
        if (activatedPlugins) {
          const pluginInfo = activatedPlugins.find(p => p.name === plugin.name)
          if (pluginInfo && pluginInfo.activated) isActive = true;
        }
        plugin.isActive = isActive;
      });
    })
  },
  _loadPluginsSettings () {
    return this._db.models.option.getOptionsByGroup(`plugins_settings`)
    .then(pluginsSettings => {
      const settingsToSave = [];
      this.plugins.forEach(plugin => {
        if (plugin.settings && plugin.isActive) {
          const optionName = `plugins_settings:${plugin.name}`;
          const savedPluginSettings = pluginsSettings.find(po => po.name === optionName);
          // const optionsValue = Object.assign({}, plugin.settings, savedPluginSettings ? savedPluginSettings.value : {});
          const optionsValue = deepmerge(plugin.settings, savedPluginSettings ? savedPluginSettings.value : {});
          settingsToSave.push({ name : optionName, type : `object`, value : optionsValue });
        }
      })

      return this._db.models.option.setOptions(settingsToSave);
    })
    .then(options => {
      // console.log(`options saved `);
      // console.log(options);
      options.forEach(option => {
        const plugin = this.plugins.find(p => p.name === option.name.split(`:`, 2)[1]);
        plugin.settings = option.value;
      })
    })
  },
  _loadPluginsReady () {
    return Promise.all(this.plugins
      .filter(plugin => plugin.isActive && typeof plugin.ready === `function`)
      .map(plugin => plugin.ready({
        settings: plugin.settings,
        store: this._db.models.datastore.proxiedStore(`plugin:${plugin.name}`),
      }))
    )
  },
  _loadSteps () {
    const stepMap = {};

    return Promise.resolve()
    .then(() => {
      // load steps from plugins :
      this.plugins.forEach(plugin => {
        if (!plugin.isActive) return;
        plugin.steps.forEach(step => {
          
          const handlers = plugin.stepHandlers.filter(handler => handler.step === step.name);
          if (!handlers) { return }
          handlers.forEach(handler => {
            handler.plugin = plugin;
            handler.activated = plugin.isActive && handler.activatedByDefault;
          });

          const activatedHandlers = handlers.filter(h => h.activated);

          if (stepMap[step.name]) {
            stepMap[step.name].handlers = stepMap[step.name].handlers.concat(handlers);
            stepMap[step.name].activatedHandlers = stepMap[step.name].activatedHandlers.concat(activatedHandlers);
          } else {
            stepMap[step.name] = {
              activatedHandlers,
              handlers : [].concat(handlers),
              activated : step.activatedByDefault || false,
              sort : step.priority || 1,
            }
          }
        })
      })
    })
    .then(() => this._db.models.step.fetchAll())
    .then(steps => {
      // register new steps in database : 
      const promises = [];
      Object.keys(stepMap).forEach(stepName => {
        const registeredStep = steps.find(step => step.name === stepName);
        if (!registeredStep) {
          const step = stepMap[stepName];
          promises.push(this._db.models.step.changeActivation(stepName, step.activated))
        }
      })
      return Promise.all(promises);
    })
    .then(() => this._db.models.step.fetchAll())
    .then(steps => {
      steps.forEach(step => {
        if (stepMap[step.name]) {
          stepMap[step.name].activated = step.activated;
        }
      })
      console.log(`### Loaded steps from plugins : `);
      this.steps = Object.keys(stepMap)
        .map(key => Object.assign({ name : key }, stepMap[key]))
        .sort((stepA, stepB) => stepA.sort - stepB.sort);
      this.steps.forEach(step => {
        if (step.handlers) {
          step.handlers = step.handlers.sort((handlerA, handlerB) => handlerA.priority - handlerB.priority);
        }
      })
      console.log(this.steps);
    });
  },
  triggerStepActivation (stepName) {
    const step = this.steps.find(step => step.name === stepName);
    return this._db.models.step.changeActivation(step.name, !step.activated)
    .then(step => {
      this.steps.find(s => s.name === step.name).activated = step.activated;
    });
  },
  togglePluginActivation (pluginName) {
    return this._db.models.option.fetchValue(`core:activated_plugins`)
    .then(activatedPlugins => {
      if (!activatedPlugins) activatedPlugins = [];

      const pluginInfo = activatedPlugins.find(p => p.name === pluginName);
      if (pluginInfo) { pluginInfo.activated = !pluginInfo.activated }
      else activatedPlugins.push({ name : pluginName, activated : true })

      return this._db.models.option.setValue(`core:activated_plugins`, activatedPlugins);
    })
    .then(() => this._configurePlugins())
    .then(() => this._loadSteps())
    .then(() => null)
  },
  savePluginSettings (pluginName, settings) {
    const optionName = `plugins_settings:${pluginName}`;
    const plugin = this.getByName(pluginName);

    const settingToSave = deepmerge(plugin.settings, settings);
    const option = { name : optionName, type : `object`, value : settingToSave };
    console.log(option);
    return this._db.models.option.setOption(option)
    .then(() => this._configurePlugins())
  }
}


module.exports = plugins;
