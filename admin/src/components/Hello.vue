<template>
  <b-row>
    <product-list></product-list>
  </b-row>
</template>

<script>
import ProductList from './ProductList';

export default {
  name: 'hello',
  data() {
    return {
    };
  },
  components : {
    ProductList,
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
