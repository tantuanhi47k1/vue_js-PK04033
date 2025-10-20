<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'

const store = useStore()

const categories = ref([])
const products = ref([])
const searchQuery = ref('')
const sortOption = ref('Sắp xếp mặc định')
const selectedCategoryId = ref(null)

const readCategories = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/categories')
    categories.value = data
  } catch (err) {
    console.error('Error reading categories:', err)
  }
}

const readProducts = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/products')
    products.value = data
  } catch (err) {
    console.error('Error reading products:', err)
  }
}

const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId
}

const filteredAndSortedProducts = computed(() => {
  let tempProducts = [...products.value]

  if (selectedCategoryId.value) {
    tempProducts = tempProducts.filter(p => p.categoryId === selectedCategoryId.value)
  }

  if (searchQuery.value) {
    tempProducts = tempProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  switch (sortOption.value) {
    case 'Từ A -> Z':
      tempProducts.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      break
    case 'Từ Z -> A':
      tempProducts.sort((a, b) => b.name.localeCompare(a.name, 'vi'))
      break
    case 'Giá tăng dần':
      tempProducts.sort((a, b) => (a.discount || a.price) - (b.discount || b.price))
      break
    case 'Giá giảm dần':
      tempProducts.sort((a, b) => (b.discount || b.price) - (a.discount || a.price))
      break
    default:
      tempProducts.sort((a, b) => a.id - b.id)
      break
  }

  return tempProducts
})

onMounted(() => {
  readCategories()
  readProducts()
})

const addToCart = (product) => {
  if (product.quantity > 0) {
    store.dispatch('cart/addProductToCart', product)
    Swal.fire({
      icon: 'success',
      title: 'Đã thêm vào giỏ hàng!',
      showConfirmButton: "OK",
      confirmButtonColor: '#000',
      text: 'Sản phẩm đã được thêm vào giỏ hàng.',
      timer: 2000
    })
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Sản phẩm đã hết hàng!',
      confirmButtonColor: '#000',
    });
  }
}

const isInWishlist = (productId) => {
  return store.getters['wishlist/isInWishlist'](productId)
}

const toggleWishlist = (product) => {
  if (isInWishlist(product.id)) {
    store.dispatch('wishlist/removeFromWishlist', product.id)
  } else {
    store.dispatch('wishlist/addToWishlist', product)
  }
}
</script>

<template>
  <div class="container-fluid my-5">
    <div class="row" style="margin-top: 130px;">
      <div class="col-lg-1 mb-4"></div>
      <div class="col-lg-2 mb-4">
        <div class="p-3 border rounded shadow-sm bg-white">
          <h5 class="fw-bold mb-3">Tìm kiếm</h5>
          <form class="input-group mb-3" @submit.prevent>
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Nhập tên sản phẩm..." />
          </form>

          <h5 class="fw-bold mt-4 mb-3">Danh mục sản phẩm</h5>
          <ul class="list-unstyled sidebar-menu">
            <li>
              <a href="#" @click.prevent="selectCategory(null)" class="text-decoration-none text-dark d-block py-2"
                :class="{ 'active-category': selectedCategoryId === null }">
                Tất cả sản phẩm
              </a>
            </li>
            <li v-for="cat in categories" :key="cat.id">
              <a href="#" @click.prevent="selectCategory(cat.id)" class="text-decoration-none text-dark d-block py-2"
                :class="{ 'active-category': selectedCategoryId === cat.id }">
                {{ cat.nameCategory }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <p class="mb-0 text-muted">Hiển thị {{ filteredAndSortedProducts.length }} sản phẩm</p>
          <select v-model="sortOption" class="form-select w-auto">
            <option>Sắp xếp mặc định</option>
            <option>Từ A -> Z</option>
            <option>Từ Z -> A</option>
            <option>Giá tăng dần</option>
            <option>Giá giảm dần</option>
          </select>
        </div>

        <div class="row g-4">
          <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="item in filteredAndSortedProducts" :key="item.id">
            <div class="card border-0 shadow-sm h-100 product-card">
              <div class="position-relative product-image-container">
                <router-link :to="`/productDetail/${item.id}`" class="text-decoration-none text-dark">
                  <img :src="item.image[0]" class="card-img-top" alt="product" />
                  <span v-if="item.discount < item.price"
                    class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1" style="font-size: 0.8rem">
                    Giảm giá!
                  </span>
                </router-link>
                <div class="product-icons">
                  <a href="#" @click.prevent="addToCart(item)" class="text-success"
                    :class="{ 'disabled-icon': item.quantity === 0 }">
                    <i class="fa fa-cart-plus"></i>
                  </a>
                  <a href="#" @click.prevent="toggleWishlist(item)" :class="{ 'text-danger': isInWishlist(item.id) }">
                    <i class="fa fa-heart"></i>
                  </a>
                </div>
              </div>

              <div class="card-body text-center">
                <router-link :to="`/productDetail/${item.id}`" class="text-decoration-none text-dark">
                  <p class="text-secondary small mb-1">
                    {{categories.find((c) => c.id === item.categoryId)?.nameCategory || 'Không có'}}
                  </p>
                  <h6 class="fw-semibold">{{ item.name }}</h6>
                  <template v-if="item.discount < item.price">
                    <p class="text-muted text-decoration-line-through small mb-1">
                      {{ Number(item.price).toLocaleString('vi-VN') }} ₫
                    </p>
                    <p class="fw-bold mb-1 text-danger">
                      {{ Number(item.discount).toLocaleString('vi-VN') }} ₫
                    </p>
                  </template>
                  <template v-else>
                    <p class="fw-bold text-danger mb-0">
                      {{ Number(item.price).toLocaleString('vi-VN') }} ₫
                    </p>
                  </template>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <p v-if="filteredAndSortedProducts.length === 0" class="text-center text-muted mt-4">
          Không tìm thấy sản phẩm nào
        </p>
      </div>
      <div class="col-lg-1 mb-4"></div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  overflow: hidden;
}

.product-image-container {
  position: relative;
}

.product-icons {
  position: absolute;
  top: 10px;
  right: -50px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: right 0.3s ease;
}

.product-card:hover .product-icons {
  right: 10px;
}

.product-icons a {
  background-color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.product-icons a:hover {
  background-color: #f0f0f0;
  transform: scale(1.1);
}

.product-icons .text-danger .fa-heart {
  color: red;
}

.sidebar-menu li a:hover,
.active-category {
  color: #35d1dc !important;
  font-weight: 700;
}

.card img {
  height: 260px;
  object-fit: cover;
  transition: 0.3s ease;
}

.card:hover img {
  transform: scale(1.05);
}

.disabled-icon {
  background-color: #f0f0f0 !important;
  color: #cccccc !important;
  cursor: not-allowed;
  pointer-events: none;
}

</style>