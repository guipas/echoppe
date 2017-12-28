import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import productsModule from './modules/products';
import ordersModule from './modules/orders';

Vue.use(Vuex)

const store = new Vuex.Store({
  strict : true,
  modules : {
    products : productsModule,
    orders : ordersModule,
    axiosConfig : {},
  },
  state : {
    csrf : null,
    settings : null,
  },
  mutations : {
    setCsrf (state, csrf) {
      state.axiosConfig.headers = { 'x-csrf-token': csrf };
      state.csrf = csrf;
    },
    SET_SETTINGS (state, settings) {
      state.settings = settings;
    },
  },
  actions : {
    getCsrf ({ commit }) {
      return axios.get('/csrf')
      .then(res => {
        commit('setCsrf', res.data.csrf);
      });
    },
    getSettings ({ commit }) {
      return axios.get('/settings')
      .then(res => {
        commit('SET_SETTINGS', res.data);
      });
    },
    init ({ dispatch }) {
      return dispatch('getCsrf')
      .then(() => dispatch('getSettings'));
    },
  }
});

export default store;