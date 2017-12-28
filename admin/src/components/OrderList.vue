<template>
  <div>
    <div class="tl">
      <content-card>
        <h1>
          Orders list
        </h1>
        <hr>
          <div class="order-list" v-if="orders && orders.length >0">
            <div :key="order._id" class="product flex bg-black-10 flex-wrap" v-for="order in orders">
              <router-link class="db w-80 pa2" style="flex-grow:1;" :to="{ name : 'OrderDetails', params: { orderId : order._id} }">
                {{ order._id }}
              </router-link>
              <div class="pa2 f4" style="align-self:center;">{{ stateLabel(order.state) }}</div>
              <div class="w-100 bg-white-20 pa2 f4 pb3" style="align-self:center">Placed on : {{ moment(order.placedOn).format('YYYY-MM-DD') }}</div>
            </div>
          </div>
      </content-card>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import _ from 'lodash';
import { mapState } from 'vuex';
import ContentCard from './generics/ContentCard';
import DefaultButton from './generics/DefaultButton';
import TopNav from './TopNav';

export default {
  name: 'order-list',
  mounted () {
    this.$store.dispatch('fetchOrderList');
  },
  computed : {
    ...mapState({
      orders : state => state.orders.orders,
    }),
  },
  methods : {
    moment,
    stateLabel (state) {
      if (this.$store.state.settings) {
        const status = _.find(this.$store.state.settings.cartStatusArray, { value : state });
        return status.status;
      }
      return state;
    },
  },
  components : {
    ContentCard,
    TopNav,
    DefaultButton,
  },
};
</script>

<style scoped>
</style>
