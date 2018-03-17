<template>
  <div>
    <div class="tl">
        <h1>
          Orders list
        </h1>
        <hr>
          <b-list-group class="order-list" v-if="orders && orders.length >0">
            <b-list-group-item
              :key="order._id"
              v-for="order in orders"
              :to="{ name : 'OrderDetails', params: { orderId : order._id} }"
              class="d-flex justify-content-between align-items-center"
            >
              <span>
                ORDER ID : <bold>{{ order._id }}</bold>
              </span>
              <b-badge pill :variant="varientColor(order.state)">{{ stateLabel(order.state) }}</b-badge>
            </b-list-group-item>
          </b-list-group>
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
    varientColor (state) {
      const label = this.stateLabel(state);
      console.log('rrr', label, label === `COMPLETED`);
      if (label === 'COMPLETED') {
        console.log('mmmm')
        return `success`;
      }

      return `secondary`;
    },
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
