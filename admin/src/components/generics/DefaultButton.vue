<template>
  <button class="primary-button pa2 pl3 pr3 bg-gray bn pointer white f3">
    <slot></slot>
  </button>
</template>

<script>

export default {
  name: 'default-button',
  data() {
    return {
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
