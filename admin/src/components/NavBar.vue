<template>
<b-container>
  <!-- <div class="tabnav pa3 pt3 pb0 flex mw8 center">
    <router-link :to="item.to" v-for="(item, i) in items" :key="i" :class="item.active ? 'active' : ''" class="item">
      {{ item.label }} {{ route }}
    </router-link>
  </div> -->
  <b-navbar toggleable="md" type="light" variant="light">

    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

    <b-navbar-brand href="#">échoppe</b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">

      <b-navbar-nav>
        <b-nav-item  :to="item.to" v-for="(item, i) in items" :key="i" :class="item.active ? 'active' : ''" class="item">
          {{ item.label }} {{ route }}
        </b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">

        <!-- <b-nav-form>
          <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search"/>
          <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
        </b-nav-form>

        <b-nav-item-dropdown text="Lang" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#">ES</b-dropdown-item>
          <b-dropdown-item href="#">RU</b-dropdown-item>
          <b-dropdown-item href="#">FA</b-dropdown-item>
        </b-nav-item-dropdown> -->

        <!-- <b-nav-item-dropdown right>
          <template slot="button-content">
            <em>User</em>
          </template>
          <b-dropdown-item href="#">Profile</b-dropdown-item>
          <b-dropdown-item href="#">Signout</b-dropdown-item>
        </b-nav-item-dropdown> -->
      </b-navbar-nav>

    </b-collapse>
  </b-navbar>

</b-container>
</template>

<script>

export default {
  name: 'navbar',
  data() {
    return {
    };
  },
  computed : {
    route () {
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
</style>
