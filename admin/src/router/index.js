import Vue from 'vue';
import Router from 'vue-router';
import Hello from '@/components/Hello';
import ProductDetails from '@/components/ProductDetails';
import OrderList from '@/components/OrderList';
import OrderDetails from '@/components/OrderDetails';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello,
      meta : {tabLabel : 'Products', displayTabNav : true },
    },
    {
      path: '/products/:productId',
      name: 'ProductDetails',
      component: ProductDetails,
      props: true,
      meta : { displayTabNav : false },
    },
    {
      path: '/order/:orderId',
      name: 'OrderDetails',
      component: OrderDetails,
      props: true,
      meta : { displayTabNav : false },
    },
    {
      path: '/orders',
      name: 'Orders',
      component: OrderList,
      meta : { tabLabel : `Orders`, displayTabNav : true, },
    },
  ],
});
