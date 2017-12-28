<template>
  <button class="cancel-button pa2 pl3 pr3 bg-grey bn pointer white f3">
    <slot></slot>
  </button>
</template>

<script>

export default {
  name: 'cancel-button',
  data() {
    return {
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
