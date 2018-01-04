'use strict';

const moment = require('moment');
const config = require('./config');


module.exports = order => {
  let receipt = '';
  receipt += '=======================================\n';
  receipt += '------------ ORDER SUMMARY ------------\n';
  receipt += '---------------------------------------\n';
  receipt += `Order: ${order._id}\n`;
  receipt += `Placed on: ${moment(order.placedOn).format('YYYY-MM-DD')}\n`;
  receipt += '---------------------------------------\n';
  receipt += '-------------- DETAILS : --------------\n';
  order.content.forEach(line => {
    receipt += '---------------------------------------\n';
    receipt += `Product : ${line.product.name.slice(0, 30)}\n`;
    receipt += `Quantity : **${line.quantity}**\n`;
    receipt += `Unit price (${config.currency.code}) : **${line.finalPrice}**\n`;
    receipt += `Total (${config.currency.code}) : **${line.finalPrice * line.quantity}**\n`;
  })
  receipt += '---------------------------------------\n';
  receipt += '---------------------------------------\n';
  receipt += `ORDER TOTAL (${config.currency.code}) : **${order.content.reduce((total, line) => total + line.finalPrice * line.quantity, 0).toFixed(2)}**\n`;
  receipt += '=======================================\n';

  return receipt;
}
