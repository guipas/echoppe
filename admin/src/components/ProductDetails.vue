<template>
  <div>
    <top-nav>
      <div class="tl">
        <default-button v-on:click.native="goToProductList">&larr; Back</default-button>
      </div>
    </top-nav>
    <div class="product" v-if="product">
      <content-card>
        <h2>Product details</h2>
        <hr/>
        <div class="product-form-element product-id" v-if="product.id">
          <label>Id :</label>
          <input type="text" class="" v-model="productId" disabled/>
        </div>
        <div class="product-form-element product-name">
          <label>Name :</label>
          <input type="text" class="" v-model="product.name" :disabled="loading"/>
        </div>
        <div class="product-form-element product-description">
          <label>Description :</label>
          <textarea class="" v-model="product.description" :disabled="loading"></textarea>
        </div>
        <div class="product-form-element product-images-upload">
          <template v-if="product.id">
            <label>Images upload :</label>
            <div>
              <input :disabled="!product.id || loading" type="file" multiple id="product-details-uploads"/>
              <primary-button class="" v-on:click.native="uploadImages">Upload</primary-button>

            </div>
          </template>
          <template v-else class="flex w-100">
            <label>Images upload :</label>
            <div class="upload-no-new">
              <em>You need to save the product before being able to add images to it</em>
            </div>
          </template>
        </div>
        <div class="product-form-element product-images-gallery" v-if="product.id">
          <label>Product images :</label>
          <div class="product-images tl mt4">
            <div class="product-images-item relative" v-for="upload in originalProduct.uploads" :key="upload.id">
              <img :src="upload.link + '/thumbnail?format=small_square'" alt="">
              <div class="product-images-item-delete pointer absolute right-0 bottom-0" v-on:click="deleteUpload(upload)">❌</div>
              <div class="product-images-item-feature pointer absolute right-2 bottom-0" v-on:click="featureUpload(upload)">{{ product.featured && product.featured._id === upload._id ? '⭐️' : '☆' }}</div>
            </div>
          </div>
        </div>
        <div class="product-form-element product-quantity">
          <label>Quantity :</label>
          <input type="text" class="" v-model="product.stock" :disabled="loading"/>
        </div>
        <div class="product-form-element product-price">
          <label>Price :</label>
          <input type="text" class="" v-model="product.price" :disabled="loading"/>
        </div>
        <div class="product-save tr pt4">
          <cancel-button class="" v-on:click.native="cancel">Cancel</cancel-button>
          <primary-button class="" v-on:click.native="saveProduct">Save</primary-button>
        </div>
        <hr/>
        <div class="product-delete tl pt4">
          <danger-button class="" v-on:click.native="deleteProduct">Delete this product</danger-button>
        </div>
      </content-card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';
import ContentCard from './generics/ContentCard';
import PrimaryButton from './generics/PrimaryButton';
import CancelButton from './generics/CancelButton';
import DangerButton from './generics/DangerButton';
import DefaultButton from './generics/DefaultButton';
import TopNav from './TopNav';


export default {
  name: 'product-list',
  data () {
    return {
      product : null,
    };
  },
  props: ['productId'],
  mounted () {

    this.loadProduct();
  },
  computed : {
    ...mapState({
      originalProduct : state => state.products.currentProduct,
      loading : state => state.products.currentProductLoading,
    })
  },
  methods: {
    loadProduct () {
      console.log('loading product...');
      this.product = null;
      this.$store.dispatch('fetchProduct', this.productId)
      .then(() => {
        this.product = _.cloneDeep(this.originalProduct);
        console.log('loaded product: ', this.product);
      });
    },
    saveProduct () {
      this.$store.dispatch('saveProduct', this.product);
    },
    cancel () {
      this.$router.push('/');
    },
    test () {
      this.$store.dispatch('test');
    },
    deleteProduct () {
      this.$store.dispatch('deleteProduct', this.product);
    },
    uploadImages () {
      this.$store.dispatch('saveProductImages', this.product);
    },
    deleteUpload (upload) {
      this.$store.dispatch('deleteUpload', { upload, product : this.product });
    },
    goToProductList () {
      this.$router.push('/');
    },
    featureUpload (upload) {
      if (this.product.featured && this.product.featured._id === upload._id) {
        this.product.featured = null;
      } else {
        this.product.featured = upload;
      }
    },
  },
  watch: {
    productId (val) {
      this.loadProduct();
    },
  },
  components: {
    ContentCard,
    PrimaryButton,
    CancelButton,
    DangerButton,
    TopNav,
    DefaultButton,
  },
};
</script>

<style scoped>
.product-form-element {
  display: flex;
  padding-top: 0.75em;
}
.product-form-element label {
  display: block;
  padding: .25em;
  width: 33%;
}
.product-form-element input[type="text"],
.product-form-element .product-images,
.product-form-element .upload-no-new {
  width: 66%;
}
.product-form-element textarea {
  width: 66%;
  height: 6rem;
}

.product-form-element > div {
  width: 66%;
}

.product-images-item {
  display: inline-block;
  padding: 0px;
  margin: 5px;
  border: 1px solid #ddd;
}
</style>
