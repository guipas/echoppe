'use strict';

const nodemailer = require('nodemailer');
const log = require('./debugLog').log;
const config = require('./config');


module.exports = {
  transporter : null,
  init (config) {
    if (config.emails && config.emails.transporter) {
      log('Mailer configuration present, creating transporter.');
      this.transporter = nodemailer.createTransport(config.emails.transporter);
    } else {
      log('No mailer configured');
    }
  },
  sendMail (options) {
    log('Sending email... ', options);
    if (this.transporter) {
      if (!options.from) { options.from = config.emails.from }
      Reflect.apply(this.transporter.sendMail, this.transporter, [options]);
    }
  },
};
