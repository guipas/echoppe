'use strict';


module.exports = {
  option : [
    {
      name : `shop_settings:name`,
      label : `Site name`,
      value : `Echoppe`,
      type : `string`,
    },
    {
      name : `shop_settings:description`,
      label : `Site description`,
      value : `Echoppe`,
      type : `string`,
    },
  ],
  product : [
    {
      uid : `ee91f46e-5bc3-4942-8b0c-07e9ffbd4ce4`,
      name : `Example product`,
      description : `This is an example product !`,
      stock : 1,
      visible : true,
    },
    {
      uid : `b1772c07-d8d8-48f5-90b4-019cdab90866`,
      name : `Example product 2`,
      description : `This is an example product !`,
      stock : 0,
      visible : true,
    },
    {
      uid : `cdbe319d-df24-420c-8e18-6dc2c83cf453`,
      name : `Example product 3`,
      description : `This is an example product !`,
      stock : 10,
      visible : true,
    }
  ],
  price : [
    {
      uid : `a85f3246-cf16-4bf8-b100-4bce1a4edeec`,
      value : 9.99,
      currency : `USD`,
      product_uid : `ee91f46e-5bc3-4942-8b0c-07e9ffbd4ce4`,
    },
    {
      uid : `00afdccb-10e6-4999-9e0d-26b33e336b00`,
      value : 0,
      currency : `USD`,
      product_uid : `b1772c07-d8d8-48f5-90b4-019cdab90866`,
    },
    {
      uid : `807590b1-5785-44bd-bde8-2c28d4d2e615`,
      value : 10,
      currency : `USD`,
      product_uid : `cdbe319d-df24-420c-8e18-6dc2c83cf453`,
    },
  ],
  upload : [
    {
      uid : `798272a8-efb5-4474-a6f6-17bb3a6c5985`,
      name : `book1.jpg`,
      mimetype : `image/jpeg`,
      filename : `seed/book1.jpg`,
    },
    {
      uid : `02a4de38-8230-4d5b-a281-82adf37aea2f`,
      name : `book2.jpg`,
      mimetype : `image/jpeg`,
      filename : `seed/book2.jpg`,
    },
    {
      uid : `a6d09a20-421b-4eda-82bb-917d28b2b177`,
      name : `book2.jpg`,
      mimetype : `image/jpeg`,
      filename : `seed/book3.jpg`,
    }
  ],
  upload_product : [
    {
      product_uid : `ee91f46e-5bc3-4942-8b0c-07e9ffbd4ce4`,
      upload_uid : `798272a8-efb5-4474-a6f6-17bb3a6c5985`,
    },
    {
      product_uid : `b1772c07-d8d8-48f5-90b4-019cdab90866`,
      upload_uid : `02a4de38-8230-4d5b-a281-82adf37aea2f`,
    },
    {
      product_uid : `cdbe319d-df24-420c-8e18-6dc2c83cf453`,
      upload_uid : `a6d09a20-421b-4eda-82bb-917d28b2b177`,
    },
  ]
};
