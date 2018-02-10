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
    products : [],
    productsLoading : true,
    currentProduct : null,
    currentProductLoading : false,
  },
  mutations : {
    setProducts(state, products) {
      state.products = products;
    },
    setProductsLoading(state, loading) {
      state.productsLoading = loading;
    },
    setCurrentProduct(state, product) {
      state.currentProduct = product;
    },
    setCurrentProductLoading(state, loading) {
      state.currentProductLoading = loading === true;
    },
  },
  actions : {
    init({ dispatch }) {
    },
    fetchProductList({ commit }) {
      commit('setProductsLoading', true);
      return axios.get('/products')
      .then(res => {
        log('Product list received', res.data);
        commit('setProducts', res.data);
      })
      .catch(err => {
        log(err);
      })
      .then(() => {
        commit('setProductsLoading', false);
      })
    },
    fetchProduct({ commit }, _id) {
      commit('setCurrentProductLoading', true);
      if (_id === `new`) {
        commit('setCurrentProduct', { name : `` });
        commit('setCurrentProductLoading', false);
        return;
      }

      return axios.get(`/products/${_id}`)
      .then(res => {
        commit('setCurrentProduct', res.data);
      })
      .catch(err => {
        log(err);
      })
      .then(() => {
        commit('setCurrentProductLoading', false);
      });
    },
    saveProduct({ commit, dispatch, rootState }, product) {
      commit('setCurrentProductLoading', true);
      if (product._id) {
        return axios.put(`/products/${product._id}`, product,rootState.axiosConfig)
        .then(() => {
          log('Product updated successfuly');
          // router.push('/');
          return dispatch(`fetchProduct`, product._id);
        })
      }

      return axios.post(`/products`, product, rootState.axiosConfig)
      .then(() => {
        log('product created successfully');
        router.push('/');
      })
    },
    saveProductImages({ commit, rootState, dispatch }, product) {
      commit('setCurrentProductLoading', true);
      log('saving product images...');
      var data = new FormData();
      const elem = document.getElementById('product-details-uploads');
      for (var x = 0; x < elem.files.length; x++) {
        data.append("files", elem.files[x]);
      }
      axios.post(`/products/${product._id}/uploads`, data, rootState.axiosConfig)
      .then(res => {
        log('upload success', res);
        dispatch('fetchProduct', product._id);
        commit('setCurrentProductLoading', false);
      })
      .catch(err => {
        log('upload error', err);
        commit('setCurrentProductLoading', false);
      })
    },
    deleteProduct ({ rootState }, product) {
      return axios.delete(`/products/${product.id}`, rootState.axiosConfig)
      .then(() => {
        log('product deleted successfully');
        router.push('/');
      });
    },
    deleteUpload ({ rootState, dispatch }, { upload, product }) {
      const uploadId = upload.id;
      return axios.delete(`/uploads/${uploadId}`, rootState.axiosConfig)
      .then(() => {
        log('upload delete succesfully');
        dispatch('fetchProduct', product._id);
      })
      .catch(err => {
        log(err);
      });
    },
  },
};