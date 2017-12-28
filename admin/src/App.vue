<template>
  <div id="app" class="">
    <header>
      <div class="mw8 center pa3 white flex flex-wrap" style="align-items:center;">
        <div class=""><img src="/admin/static/img/echoppe_logo_white.png" alt="" style="max-width: 36px;" class="pr2"></div>
        <div class="f2">Echoppe</div>
        <div class="w-100 ttu f5 pt3">Admin</div>

      </div>
    </header>
    <tab-nav></tab-nav>
    <main class="mw8 center">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import TabNav from './components/TabNav';

export default {
  name: 'app',
  mounted () {
    this.$store.dispatch('init');
  },
  components : {
    TabNav
  }
};
</script>

<style>
html {
  font-size: 12px;
}
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  font-size: 1.5rem;
}

h1, h2, h3 {
  font-size: 1.5rem;
  text-transform: uppercase;
  font-weight: bold;
}
h3 {
  text-transform: none;
}
a {
  color: black;
  text-decoration: none;
}
header {
  background: lightskyblue;
}
</style>
