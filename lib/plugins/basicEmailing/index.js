'use strict';

const ejs = require('ejs');
const path = require('path');
const config = require('../../config');
const mailer = require('../../mailer');
const receipt = require('../../receipt');
const linkTo = require('../../linkTo');

const plugin = {
  name : `basicemailing`,
  title : `Basic emailing`,
  description : `Sends an email to customers after an order has completed`,
  events : {
    'hit:index' : () => { console.log('PLUGIN HIT INDEX EVENT'); },
    'order:completed' : async (event, { cart }) => {
      const toEmail = await cart.getEmail();
      if (toEmail) {
        ejs.renderFile(path.join(__dirname, 'order-completed.ejs'), {
          receipt : receipt(cart).replace(/\n/gm, '<br/>'),
          config,
          logo : linkTo('public', 'logo.png'),
        }, (err, html) => {
          if (err) throw new Error('Error while compiling email template');
          const mailOptions = {
            to: toEmail, // list of receivers
            subject: 'Thank you for your order ✔', // Subject line
            text: `Your order on *${config.name}* has been taken into account. \n Please find your receipt below \n\n ${receipt(cart)}`, // plain text body
            html
          };
          return mailer.sendMail(mailOptions);
        });
      }
    }
  },
};


module.exports = plugin;
