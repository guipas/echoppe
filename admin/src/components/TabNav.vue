<template>
<div class="bb mb3 tabnav-container " v-if="display">
  <div class="tabnav pa3 pt3 pb0 flex mw8 center">
    <router-link :to="item.to" v-for="(item, i) in items" :key="i" :class="item.active ? 'active' : ''" class="item">
      {{ item.label }} {{ route }}
    </router-link>
  </div>

</div>
</template>

<script>

export default {
  name: 'tabnav',
  data() {
    return {
    };
  },
  computed : {
    route () {
      console.log(this.$router);
      return this.$router.name;
    },
    items () {
      return this.$router.options.routes.filter(route => route.meta && route.meta.tabLabel).map(route => ({
        label : route.meta.tabLabel,
        to : route,
        active : this.$route.name === route.name,
      }));
    },
    display () {
      return this.$route.meta && this.$route.meta.displayTabNav;
    }
  },
  components : {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .tabnav-container {
    background: #F5F5F5;
    border-color: #ccc;
  }
  .item {
    padding: 10px;
    display: block;
  }
  .item.active {
    border-top-left-radius : 3px;
    border-top-right-radius : 3px;
    border: 1px solid #CCC;
    border-bottom: 1px solid white;
    /* border-top: 4px solid black; */
    margin-bottom: -1px;
    background: white;
  }
</style>
