<template>
  <b-col>
    <top-nav>
      <div class="py-3 text-right">
        <b-btn v-on:click="goToNewProduct">+ New product</b-btn>
      </div>
    </top-nav>
    <div class="tl">
      <content-card>
        <h1 class="h3">
          Product list
        </h1>
        <!-- <hr> -->
        <b-list-group class="product-list" v-if="products && products.length >0">
          <b-list-group-item :key="product._id" class="product pa2 bg-black-10" v-for="product in products" :to="{ name : 'ProductDetails', params: { productId : product._id} }">
            {{ product.name }}
          </b-list-group-item>
        </b-list-group>
      </content-card>
    </div>
  </b-col>
</template>

<script>
import { mapState } from 'vuex';
import ContentCard from './generics/ContentCard';
import DefaultButton from './generics/DefaultButton';
import TopNav from './TopNav';

export default {
  name: 'product-list',
  data () {
    return {
    }
  },
  mounted () {
    this.$store.dispatch('fetchProductList');
  },
  computed : {
    ...mapState({
      products : state => state.products.products,
    }),
  },
  methods : {
    goToNewProduct () {
      this.$router.push('/products/new');
    },
  },
  components : {
    ContentCard,
    TopNav,
    DefaultButton,
  },
  // computed : mapState({
  //   products : state => state.products.products,
  // })
};
</script>

<style scoped>
.products .product {

}
</style>
