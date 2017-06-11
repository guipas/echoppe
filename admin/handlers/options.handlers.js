'use strict';

const handlers = {
  list : async function (req, res, next) {
    const defaultOptions = [
      { name : `shop_options:name`, value : `Echoppe`, type : `string`, group : `shop_options` },
      { name : `shop_options:description`, value : `My ecommerce`, type : `string`, group : `shop_options` },
    ];
    const options = await req.shop.models.option.getOptionsByGroup(`shop_options`, defaultOptions);

    res.render(`options/list`, { options, csrf : req.csrfToken() });
  },
  save : async function (req, res) {
    console.log(req.body.options);

    if (req.body.options) {
      const options = Object.keys(req.body.options).map(optionName => ({
        name : optionName,
        value : req.body.options[optionName],
        group : `shop_options`,
      }));
      await req.shop.models.option.setOptions(options);
    }

    if (req.wantsJson) {
      const options = await req.shop.models.option.getOptionsByGroup(`shop_options`);
      return res.json(options);
    }
    return res.redirect(`/admin/options`);
  }
}

module.exports = handlers;
