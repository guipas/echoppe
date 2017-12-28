<template>
  <div class="pb4">
    <top-nav>
      <div class="tl">
        <default-button v-on:click.native="goToOrderList">&larr; Back</default-button>
      </div>
    </top-nav>
    <span v-if="!order && loading">Loading...</span>
    <div class="order" v-if="order">
      <content-card>
        <h2>Order details</h2>
        <hr/>
        <form-element>
          <label>Id :</label>
          <input type="text" v-model="order._id" disabled/>
        </form-element>
        <form-element three>
          <label>Status</label>
          <select class="" v-model="selectedState" :disabled="loading">
            <option :value="orderStatus['COMPLETED']">COMPLETED</option>
            <option :value="orderStatus['SHIPPED']">SHIPPED</option>
            <option :value="orderStatus['RECEIVED']">RECEIVED</option>
          </select>
          <span v-if="loading" class="db pl1">Saving...</span>
        </form-element>
        <hr/>
        <h3>Order Content</h3>
        <div>
          <div class="flex">
            <div class="w-25 ba tc ma1 ml0 pa1 overflow-hidden" style="white-space:nowrap;text-overflow:ellipsis;">Product</div>
            <div class="w-25 ba tc ma1 pa1">Price</div>
            <div class="w-25 ba tc ma1 pa1">Quantity</div>
            <div class="w-25 ba tc ma1 mr0 pa1">Total</div>
          </div>
          <div class="flex" v-for="(line, i) in order.content" :key="i">
            <div class="w-25 ba ma1 ml0 pa1 overflow-hidden" style="white-space:nowrap;text-overflow:ellipsis;">{{ line.product.name }}</div>
            <div class="w-25 ba ma1 pa1">{{ line.finalPrice }}</div>
            <div class="w-25 ba ma1 pa1">{{ line.quantity }}</div>
            <div class="w-25 ba ma1 mr0 pa1">{{ line.quantity * line.finalPrice }}</div>
          </div>
        </div>
        <div v-if="address">
          <hr>
          <h3>Address</h3>
          <div class="flex">
            <div class="">
              <span class="db pa1 address-element">Email :</span>
              <span class="db pa1 address-element">Address 1 : </span>
              <span class="db pa1 address-element">Address 2 : </span>
              <span class="db pa1 address-element">State : </span>
              <span class="db pa1 address-element">Zipcode :</span>
              <span class="db pa1 address-element">Country :</span>
            </div>
            <div class="" style="flex-grow:1;">
              <span class="db pa1 b address-element"><span>{{ address.email }}&nbsp;</span></span>
              <span class="db pa1 b address-element"><span>{{ address.line1 }}&nbsp;</span></span>
              <span class="db pa1 b address-element"><span>{{ address.line2 }}&nbsp;</span></span>
              <span class="db pa1 b address-element"><span>{{ address.state }}&nbsp;</span></span>
              <span class="db pa1 b address-element"><span>{{ address.zipcode }}&nbsp;</span></span>
              <span class="db pa1 b address-element"><span>{{ address.country }}&nbsp;</span></span>
            </div>

          </div>
        </div>
        <div v-if="payment">
          <hr>
          <h3>Payment</h3>
          <div class="flex">
            <div>
              <span class="db pa1 payment-element">Status: </span>
              <span class="db pa1 payment-element">Captured:</span>
              <span class="db pa1 payment-element">Amount: </span>
            </div>
            <div>
              <span class="db pa1 b payment-element"><span>{{ payment.status }}</span>&nbsp;</span>
              <span class="db pa1 b payment-element"><span>{{ payment.captured }}</span>&nbsp;</span>
              <span class="db pa1 b payment-element"><span>{{ payment.amount / 100 }} {{ payment.currency }}</span>&nbsp;</span>
            </div>

          </div>
        </div>
      </content-card>
    </div>
  </div>
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
