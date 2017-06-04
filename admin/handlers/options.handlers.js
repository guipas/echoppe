'use strict';

const handlers = {
  list : async function (req, res, next) {
    const defaultOptions = [
      { name : `siteName`, value : `Echoppe`, type : `string`, group : `shop:settings` },
      { name : `description`, value : `My ecommerce`, type : `string`, group : `shop:settings` },
    ];
    const options = await req.shop.models.option.getOptionsByGroup(`shop:settings`, defaultOptions);

    res.render(`options/list`, { options });
  }
}

module.exports = handlers;
