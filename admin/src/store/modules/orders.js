import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import router from '../../router';


const log = (...x) => {
  if (process.env.NODE_ENV === `development`) {
    console.log(`${moment().format(`DD/MM/YY HH:mm`)} - `, ...x);
  }
};

export default {
  strict : true,
  state : {
    orders : [],
    currentOrder : null,
    currentOrderLoading : true,
  },
  mutations : {
    SET_ORDERS (state, orders) {
      state.orders = orders;
    },
    SET_CURRENT_ORDER (state, order) {
      state.currentOrder = order;
    },
    SET_CURRENT_ORDER_LOADING (state, loading) {
      state.currentOrderLoading = loading;
    },
  },
  actions : {
    fetchOrderList ({ commit }) {
      return axios.get('/orders')
      .then(res => {
        commit(`SET_ORDERS`, res.data);
      })
    },
    fetchOrder ({ commit }, orderId) {
      commit('SET_CURRENT_ORDER_LOADING', true);
      return axios.get(`/orders/${orderId}`)
      .then(res => {
        commit('SET_CURRENT_ORDER', res.data);
        commit('SET_CURRENT_ORDER_LOADING', false);
      });
    },
    changeOrderState ({ dispatch }, state) {
      return dispatch('updateOrder', { state });
    },
    updateOrder ({ commit, rootState, state, dispatch }, order) {
      commit('SET_CURRENT_ORDER_LOADING', true);
      return axios.put(`/cart/${state.currentOrder._id}`, order, rootState.axiosConfig)
      .then(() => dispatch(`fetchOrder`, state.currentOrder._id))
      .catch(err => {
        commit('SET_CURRENT_ORDER_LOADING', false);
      })
    },

  },
};