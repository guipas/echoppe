<template>
  <div class="admin-form-element" :class="{ three : three }">
    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'form-element',
  props : ['three'],
  data() {
    return {
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.admin-form-element {
  display: flex;
  padding-top: 0.5em;
}
.admin-form-element label {
  display: block;
  padding: .25em;
  width: 33%;
}
.admin-form-element input[type="text"],
.admin-form-element .product-images,
.admin-form-element .upload-no-new {
  width: 66%;
}
.admin-form-element textarea {
  width: 66%;
  height: 6rem;
}

.product-images-item {
  display: inline-block;
  padding: 0px;
  margin: 5px;
  border: 1px solid #ddd;
}
</style>
