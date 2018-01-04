'use strict';

const config = require('../../config');
const mailer = require('../../mailer');

const plugin = {
  name : `basicemailing`,
  title : `Basic emailing`,
  description : `Sends an email to customers after an order has completed`,
  initEvents (eventManager) {
    eventManager.on('hit:index', () => {
      console.log('PLUGIN HIT INDEX EVENT');
    });

    eventManager.on('order:completed', async cartManager => {
      const toEmail = await cartManager.getEmail();
      if (toEmail) {
        const mailOptions = {
          to: toEmail, // list of receivers
          subject: 'Thank you for your order ✔', // Subject line
          text: `Your order on *${config.name}* has been taken into account`, // plain text body
          html: `Your order on <strong>${config.name}</strong> has been taken into account` // html body
        };
        mailer.sendMail(mailOptions);
      }
    });

  },
};


module.exports = plugin;
