'use strict';

const fs = require(`fs`);
const path = require(`path`);
const config = require(`../config`);
const express = require(`express`);

const plugins = {
  plugins : [],
  steps : {},
  _db : null,
  init (db, app) {
    this._db = db;
    return this._loadPlugins(app)
    .then(() => {
      this._loadSteps();
    })
  },
  getActiveSteps () {
    return this.steps.filter(step => step.activated);
  },
  _loadPlugins (app) {
    return new Promise((resolve, reject) => {
      fs.readdir(path.join(config.contentDir, `plugins`), `utf8`, (err, files) => {
        if (err) reject(err);
        files.forEach(file => {
          this.plugins.push(require(path.join(config.contentDir, `plugins`, file, `plugin`))); // eslint-disable-line
          app.use(`/plugins/${file}/public`, express.static(path.join(config.contentDir, `plugins`, file, `public`)));
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
        handlers.forEach(handler => {
          handler.plugin = plugin.name;
          handler.activated = handler.activatedByDefault || false;
        });

        if (stepMap[step.name]) {
          stepMap[step.name].handlers = stepMap[step.name].handlers.concat(handlers);
        } else {
          stepMap[step.name] = {
            handlers : [].concat(handlers),
            activated : step.activatedByDefault || false,
            sort : step.priority || 1,
          }
        }
      })
    })
    return this._db.models.step.fetchAll()
    .then(steps => {
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
  }
}


module.exports = plugins;
