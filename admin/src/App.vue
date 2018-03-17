<template>
  <div id="app" class="">
    <!-- <header>
      <div class="mw8 center pa3 white flex flex-wrap" style="align-items:center;">
        <div class=""><img src="/admin/static/img/echoppe_logo_white.png" alt="" style="max-width: 36px;" class="pr2"></div>
        <div class="f2 w-100">Echoppe</div>
        <div class="ttu f5 pt3">Admin</div>
        <div class="f5 pt3 tr pointer" style="flex-grow:1;" @click="signout">&rarr; Sign out</div>

      </div>
    </header> -->

    <nav-bar></nav-bar>
    <main>
      <b-container>
        <router-view></router-view>
      </b-container>
    </main>
  </div>
</template>

<script>
import TabNav from './components/TabNav';
import NavBar from './components/NavBar';

export default {
  name: 'app',
  mounted () {
    this.$store.dispatch('init');
  },
  components : {
    TabNav,
    NavBar
  },
  methods : {
    signout() {
      this.$store.dispatch('signOut');
    }
  }
};
</script>

<style>
  body {
    font-family: 'Roboto', sans-serif;
    background: #f8f9fa;
  }

</style>
