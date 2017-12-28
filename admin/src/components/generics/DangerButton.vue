<template>
  <button class="danger-button pa2 pl3 pr3 bg-red bn pointer white f3">
    <slot></slot>
  </button>
</template>

<script>

export default {
  name: 'danger-button',
  data() {
    return {
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
