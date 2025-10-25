<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import Swal from 'sweetalert2';

const store = useStore();

const wishlist = computed(() => store.getters['wishlist/wishlist']);

const removeFromWishlist = (productId) => {
  Swal.fire({
    title: 'Xác nhận xoá',
    text: 'Bạn có chắc muốn xoá sản phẩm này khỏi danh sách yêu thích?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#000',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Huỷ'
  }).then((result) => {
    if (result.isConfirmed) {
      store.dispatch('wishlist/removeFromWishlist', productId);
      Swal.fire({
        icon: 'success',
        title: 'Đã xoá!',
        text: 'Sản phẩm đã được xoá khỏi danh sách yêu thích.',
        showConfirmButton: false,
        timer: 1500
      });
    }
  });
};

const addToCart = (product) => {
  if (product.quantity > 0) {
    store.dispatch('cart/addProductToCart', product);
    Swal.fire({
      icon: 'success',
      title: 'Đã thêm vào giỏ hàng!',
      text: `${product.name} đã được thêm vào giỏ hàng.`,
      showConfirmButton: false,
      timer: 1500
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Sản phẩm đã hết hàng!',
      confirmButtonColor: '#000',
    });
  }
};

const formatPrice = (price) => {
  return Number(price).toLocaleString('vi-VN') + ' ₫';
};
</script>

<template>
  <div class="container my-5">
    <h2 class="mb-4 text-center" style="margin-top: 130px;">Sản phẩm yêu thích 💖</h2>

    <div v-if="wishlist.length === 0" class="text-center mt-5">
      <p class="fs-5">Danh sách yêu thích của bạn đang trống.</p>
      <router-link to="/shop" class="btn btn-success mt-2">Bắt đầu mua sắm</router-link>
    </div>

    <div v-else class="row g-4">
      <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="product in wishlist" :key="product.id">
        <div class="card h-100 shadow-sm border-0 product-card">
          <router-link :to="`/productDetail/${product.id}`" class="text-decoration-none text-dark">
            <img :src="product.image[0]" class="card-img-top" :alt="product.name" style="height: 250px; object-fit: cover;">
          </router-link>
          <div class="card-body text-center d-flex flex-column">
            <h6 class="fw-semibold mb-1">{{ product.name }}</h6>
            <template v-if="product.discount && product.discount < product.price">
              <p class="text-muted text-decoration-line-through small mb-1">{{ formatPrice(product.price) }}</p>
              <p class="text-danger fw-bold mb-2">{{ formatPrice(product.discount) }}</p>
            </template>
            <template v-else>
              <p class="text-danger fw-bold mb-2">{{ formatPrice(product.price) }}</p>
            </template>
            <div class="d-flex justify-content-center gap-2 mt-auto">
              <button @click="addToCart(product)" class="btn btn-dark btn-sm">Thêm vào giỏ hàng 🛒</button>
              <button @click="removeFromWishlist(product.id)" class="btn btn-outline-danger btn-sm">Xoá</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card img {
  transition: 0.3s ease;
}
.product-card:hover img {
  transform: scale(1.05);
}
</style>
