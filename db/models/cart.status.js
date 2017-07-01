'use strict';

module.exports = {
  CART_NEW : 0,
  CART_LOCKED : 3,
  CART_PROCESSING : 5, // all steps fulfilled, order accepted but waiting for external validation, cart content cant be modified anymore
  CART_ORDERED : 10, // order accepted (payment validated...), we can send the products
  CART_COMPLETED : 15, // product sent
}
