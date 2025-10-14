<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const wishlist = computed(() => store.getters['wishlist/wishlist']);

const removeFromWishlist = (productId) => {
  if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
    store.dispatch('wishlist/removeFromWishlist', productId);
  }
};

const addToCart = (product) => {
  store.dispatch('cart/addProductToCart', product);
  alert('Đã thêm vào giỏ hàng!');
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};
</script>

<template>
  <div class="container my-5">
    <h2 class="mb-4">Sản phẩm yêu thích</h2>

    <div v-if="wishlist.length === 0" class="text-center mt-5">
      <p class="fs-5">Danh sách yêu thích của bạn đang trống.</p>
      <router-link to="/shop" class="btn btn-primary mt-2">Bắt đầu mua sắm</router-link>
    </div>

    <div v-else class="row g-4">
      <div class="col-md-3" v-for="product in wishlist" :key="product.id">
        <div class="card h-100 shadow-sm border-0">
          <router-link :to="`/productDetail/${product.id}`">
            <img :src="product.image[0]" class="card-img-top" :alt="product.name" style="height: 250px; object-fit: cover;">
          </router-link>
          <div class="card-body d-flex flex-column">
            <h6 class="card-title">{{ product.name }}</h6>
            <p class="card-text text-danger fw-bold mt-auto">{{ formatPrice(product.discount || product.price) }}</p>
            <div class="d-grid gap-2 d-md-flex justify-content-start mt-2">
                <button @click="addToCart(product)" class="btn btn-primary btn-sm">Thêm vào giỏ</button>
                <button @click="removeFromWishlist(product.id)" class="btn btn-outline-danger btn-sm">Xóa</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>