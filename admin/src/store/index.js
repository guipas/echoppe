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
    SET_CSRF (state, csrf) {
      state.axiosConfig.headers = { 'x-csrf-token': csrf };
      state.csrf = csrf;
    },
    SET_SETTINGS (state, settings) {
      state.settings = settings;
      state.axiosConfig.baseUrl = settings.url;
    },
  },
  actions : {
    getCsrf ({ commit }) {
      return axios.get('/csrf')
      .then(res => {
        commit('SET_CSRF', res.data.csrf);
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
    signOut ({ state }) {
      return axios.post(`/admin/logout`, null, state.axiosConfig)
      .then(() => {
        document.location.href = state.settings.url;
      });
    },
  },
});

export default store;