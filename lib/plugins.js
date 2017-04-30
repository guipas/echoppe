'use strict';

const fs = require(`fs`);
const path = require(`path`);
const config = require(`../config`);
const db = require(`../db/db`);

const plugins = {
  plugins : [],
  steps : {},
  init () {
    return this._loadPlugins()
    .then(() => {
      this._loadSteps();
    })
  },
  getActiveSteps () {
    return this.steps.filter(step => step.activated);
  },
  _loadPlugins () {
    return new Promise((resolve, reject) => {
      fs.readdir(path.join(config.contentDir, `plugins`), `utf8`, (err, files) => {
        if (err) reject(err);
        files.forEach(file => {
          this.plugins.push(require(path.join(config.contentDir, `plugins`, file, `plugin`))) // eslint-disable-line
        })
        resolve(true);
      })
    })
  },
  _loadSteps () {
    const stepMap = {};
    this.plugins.forEach(plugin => {
      plugin.steps.forEach(step => {
        const handlers = plugin.stepHandlers.filter(handler => handler.step === step.name);
        if (!handlers) { return }
        // console.log(handlers);
        handlers.forEach(handler => handler.plugin = plugin.name);

        if (stepMap[step.name]) {
          stepMap[step.name].handlers.concat(handlers);
        } else {
          stepMap[step.name] = {
            handlers : [].concat(handlers),
            activated : false,
            sort : step.sort || 1,
          }
        }
      })
    })
    return db.models.step.fetchAll()
    .then(steps => {
      steps.forEach(step => {
        if (step.activated && stepMap[step.name]) {
          stepMap[step.name].activated = true;
        }
      })
      console.log(`### Loaded steps from plugins : `);
      this.steps = Object.keys(stepMap)
        .map(key => Object.assign({ name : key }, stepMap[key]))
        .sort((stepA, stepB) => stepA.sort - stepB.sort);
      this.steps.forEach(step => {
        if (step.handlers) {
          step.handlers = step.handlers.sort((stepA, stepB) => stepA.sort - stepB.sort);
        }
      })
      console.log(this.steps);
    });
  },
  triggerStepActivation (stepName) {
    const step = this.steps.find(step => step.name === stepName);
    return db.models.step.changeActivation(step.name, !step.activated)
    .then(step => {
      this.steps.find(s => s.name === step.name).activated = step.activated;
    });
  }
}


module.exports = plugins;
