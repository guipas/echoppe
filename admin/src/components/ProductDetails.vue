<template>
  <b-row>
    <b-col cols="12" class="py-3">
      <top-nav>
        <div class="tl">
          <b-btn v-on:click="goToProductList">&larr; Back</b-btn>
        </div>
      </top-nav>
    </b-col>
    <b-col>

      <b-card class="product" v-if="product">
        <b-card-body>
          <h2>Product details</h2>
          <hr/>
          <b-form-group id="fieldset1" label="ID" label-for="id">
            <b-form-input id="id" type="text" class="" v-model="productId" disabled/>
          </b-form-group>

          <b-form-group id="fieldset2" label="Name" label-for="name">
            <b-form-input id="name" v-model="product.name" :disabled="loading"/>
          </b-form-group>

          <b-form-group id="fieldset3" label="Description" label-for="description">
            <b-form-textarea class="" v-model="product.description" :disabled="loading"></b-form-textarea>
          </b-form-group>

          <div class="product-form-element product-images-gallery" v-if="product.id">
            <label>Product images :</label>
            <div class="product-images tl mt4">
              <!-- <div class="product-images-item relative" v-for="upload in originalProduct.uploads" :key="upload.id">
                <img :src="upload.link + '/thumbnail?format=small_square'" alt="">
                <div class="product-images-item-delete pointer absolute right-0 bottom-0" v-on:click="deleteUpload(upload)">❌</div>
                <div class="product-images-item-feature pointer absolute right-2 bottom-0" v-on:click="featureUpload(upload)">{{ product.featured && product.featured._id === upload._id ? '⭐️' : '☆' }}</div>
              </div> -->
                <b-card
                  v-for="upload in originalProduct.uploads" :key="upload.id"
                  :img-src="upload.link + '/thumbnail?format=small_square'"
                  img-top
                  style="max-width: 200px"
                  class="mb-2">
                <b-btn size="sm" variant="secondary" v-on:click="deleteUpload(upload)">Delete</b-btn>
                  {{ product.featured ? product.featured._id : null }} /
                  {{ upload._id }}
                <b-btn size="sm" variant="secondary" v-on:click="featureUpload(upload)">
                  {{ product.featured && product.featured._id === upload._id ? '⭐ Featured' : 'Feature' }}
                </b-btn>
                </b-card>
            </div>
          </div>

          <b-form-group id="fieldset4" label="Add images" label-for="product-details-uploads" v-if="product.id">
            <b-form-file :disabled="!product.id || loading" multiple id="product-details-uploads" v-model="file" :state="Boolean(file)" placeholder="Choose a file..."></b-form-file>
            <b-btn class="my-3" v-on:click="uploadImages">Upload</b-btn>
          </b-form-group>


          <b-form-group id="fieldset5" label="Quantity" label-for="quantity">
            <b-input id="quantity" v-model="product.stock" :disabled="loading"/>
          </b-form-group>

          <b-form-group id="fieldset6" label="Price" label-for="price">
            <b-input id="price" v-model="product.price" :disabled="loading"/>
          </b-form-group>

          <div class="text-right">
            <b-btn variant="secondary" v-on:click="cancel">Cancel</b-btn>
            <b-btn variant="primary" v-on:click="saveProduct">Save</b-btn>

          </div>
          <hr/>
          <div>
            <b-btn variant="danger" v-on:click="deleteProduct">Delete this product</b-btn>
          </div>
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
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
      file : null,
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
      console.log("featuring upload...");
      if (this.product.featured && this.product.featured._id === upload._id) {
        console.log("de- featuring");
        this.product.featured = null;
      } else {
        console.log("re- featuring");
        this.product.featured = upload;
      }
      console.log(this.product);
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
/* .product-form-element {
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
} */
</style>
