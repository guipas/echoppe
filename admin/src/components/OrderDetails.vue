<template>
  <b-row>
    <b-col cols="12" class="py-3">
      <div class="tl">
        <b-btn v-on:click="goToOrderList">&larr; Back</b-btn>
      </div>
    </b-col>
    <span v-if="!order && loading">Loading...</span>
    <b-col cols="12">
      <b-card v-if="order">
        <b-card-body>
          <h2>Order details</h2>
          <hr/>
          <b-form-group id="fieldset1" label="ID" label-for="id">
            <b-form-input id="id" type="text" class="" v-model="order._id" disabled/>
          </b-form-group>

          <b-form-group id="fieldset2" label="Status" label-for="status">
            <b-form-select class="" v-model="selectedState" :disabled="loading">
              <option :value="orderStatus['COMPLETED']">COMPLETED</option>
              <option :value="orderStatus['SHIPPED']">SHIPPED</option>
              <option :value="orderStatus['RECEIVED']">RECEIVED</option>
            </b-form-select>
          </b-form-group>

          <hr/>
          <h3>Order Content</h3>
          <div>
            <b-row>
              <b-col cols="3">Product</b-col>
              <b-col cols="3">Price</b-col>
              <b-col cols="3">Quantity</b-col>
              <b-col cols="3">Total</b-col>
            </b-row>
            <b-row v-for="(line, i) in order.content" :key="i">
              <b-col cols="3">{{ line.product ? line.product.name : '?' }}</b-col>
              <b-col cols="3">{{ line.finalPrice }}</b-col>
              <b-col cols="3">{{ line.quantity }}</b-col>
              <b-col cols="3">{{ line.quantity * line.finalPrice }}</b-col>
            </b-row>
          </div>
          <div v-if="address">
            <hr>
            <h3>Address</h3>
            <b-row>
              <b-col cols="6">
                <div>Name :</div>
                <div>Email :</div>
                <div>Address 1 : </div>
                <div>Address 2 : </div>
                <div>State : </div>
                <div>Zipcode :</div>
                <div>Country :</div>
              </b-col>
              <b-col cols="6">
                <div> <span>{{ address.customer }}&nbsp;</span></div>
                <div> <span>{{ address.email }}&nbsp;</span></div>
                <div> <span>{{ address.line1 }}&nbsp;</span></div>
                <div> <span>{{ address.line2 }}&nbsp;</span></div>
                <div> <span>{{ address.state }}&nbsp;</span></div>
                <div> <span>{{ address.zipcode }}&nbsp;</span></div>
                <div> <span>{{ address.country }}&nbsp;</span></div>
              </b-col>

            </b-row>
          </div>
          <div v-if="payment">
            <hr>
            <h3>Payment</h3>
            <b-row class="flex">
              <b-col cols="6">
                <div>Status: </div>
                <div>Captured:</div>
                <div>Amount: </div>
              </b-col>
              <b-col cols="6">
                <div><span>{{ payment.status }}</span>&nbsp;</div>
                <div><span>{{ payment.captured }}</span>&nbsp;</div>
                <div><span>{{ payment.amount / 100 }} {{ payment.currency }}</span>&nbsp;</div>
              </b-col>

            </b-row>
          </div>

        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';
import ContentCard from './generics/ContentCard';
import PrimaryButton from './generics/PrimaryButton';
import CancelButton from './generics/CancelButton';
import DangerButton from './generics/DangerButton';
import DefaultButton from './generics/DefaultButton';
import TopNav from './TopNav';
import FormElement from './generics/FormElement';


export default {
  name: 'order-details',
  data () {
    return {
    };
  },
  props: ['orderId'],
  mounted () {
    this.$store.dispatch('fetchOrder', this.orderId);
  },
  computed : {
    ...mapState({
      order : state => state.orders.currentOrder,
      loading : state => state.orders.currentOrderLoading,
      orderStatus : state => state.settings ? state.settings.cartStatus : {},
    }),
    address () {
      if (this.order && this.order.stepFulfillments && this.order.stepFulfillments['order:shipping']) {
        return this.order.stepFulfillments['order:shipping'].address;
      }

      return null;
    },
    payment () {
      if (this.order && this.order.stepFulfillments && this.order.stepFulfillments['order:payment']) {
        return this.order.stepFulfillments['order:payment'].charge;
      }

      return null;
    },
    orderState () {
      let state = this.order.state;
      console.log('order status : ', this.orderStatus);
      Object.keys(this.orderStatus).forEach(status => {
        const value = this.orderStatus[status];
        if (value === this.order.state) {
          state = status;
        }
      });

      return state;
    },
    selectedState : {
      get () {
        return this.order.state;
      },
      set (val) {
        if (!val) return;
        console.log('### setting selectedState tp ', val);
        this.$store.dispatch('changeOrderState', val);
        return this.order.state;
      }
    }
  },
  methods: {
    goToOrderList () {
      this.$router.push('/orders');
    },
    changeState (...args) {
      console.log(args);
    },
  },
  watch: {
    orderId (orderId) {
      this.$store.dispatch('fetchOrder', orderId);
    },
  },
  components: {
    ContentCard,
    PrimaryButton,
    CancelButton,
    DangerButton,
    TopNav,
    DefaultButton,
    FormElement
  },
};
</script>

<style scoped>
</style>
