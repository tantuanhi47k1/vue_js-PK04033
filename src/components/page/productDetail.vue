<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const product = ref(null);
const route = useRoute();
const store = useStore();
const categories = ref([]);
const relatedProducts = ref([]);
const router = useRouter();

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const readProductDetail = async () => {
  try {
    const res = await axios.get(
      `${API_URL}/products/${route.params.id}`, ngrokHeaderConfig
    );
    product.value = res.data;

    await readRelatedProducts();
  } catch (err) {
    console.error("Err: ", err);
  }
};


const readCategories = async () => {
  try {
    const res = await axios.get(`${API_URL}/categories`, ngrokHeaderConfig);
    categories.value = res.data;
  } catch (err) {
    console.error("Err: ", err);
  }
};

const readRelatedProducts = async () => {
  if (!product.value) return;
  try {
    const res = await axios.get(`${API_URL}/products`, ngrokHeaderConfig);
    relatedProducts.value = res.data
      .filter(
        (p) =>
          p.categoryId === product.value.categoryId && p.id !== product.value.id
      )
      .slice(0, 4);
  } catch (err) {
    console.error('Err: ', err);
  }
};

const addToCart = () => {
  if (product.value && product.value.quantity > 0) {
    store.dispatch("cart/addProductToCart", product.value);
    Swal.fire({
      icon: 'success',
      title: 'Đã thêm vào giỏ hàng!',
      showConfirmButton: "OK",
      confirmButtonColor: '#000',
      text: 'Sản phẩm đã được thêm vào giỏ hàng.',
      timer: 2000
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Sản phẩm đã hết hàng!',
      text: 'Rất tiếc, bạn không thể thêm sản phẩm này vào giỏ.',
      confirmButtonColor: '#000',
    });
  }
};

const isInWishlist = (productId) => {
  return store.getters['wishlist/isInWishlist'](productId);
}

const toggleWishlist = (product) => {
  if (isInWishlist(product.id)) {
    store.dispatch('wishlist/removeFromWishlist', product.id);
  } else {
    store.dispatch('wishlist/addToWishlist', product);
  }
}

onMounted(() => {
  readProductDetail();
  readCategories();
});

watch(
  () => route.params.id,
  () => {
    readProductDetail();
    window.scrollTo(0, 0);
  }
);
</script>

<template>
  <div v-if="product" class="container my-5">
    <div class="row g-4" style="margin-top: 120px;">
      <h2 style="text-align: center;">Chi Tiết Sản Phẩm</h2>
      <div class="col-md-6">
        <div class="border rounded p-3 bg-white shadow-sm">
          <img :src="product.image[0]" class="img-fluid w-100 rounded mb-3 main-img" alt="product" />
          <div class="d-flex gap-2">
            <img v-for="(img, idx) in product.image" :key="idx" :src="img" class="img-thumbnail small-img"
              alt="gallery" />
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="p-3">
          <h2 class="fw-bold mb-2">{{ product.name }}</h2>

          <p class="text-muted mb-1">
            Danh Mục:
            {{
              categories.find((c) => c.id === product.categoryId)
                ?.nameCategory || "Không có"
            }}
          </p>

          <div class="mb-3">
            <span class="text-muted text-decoration-line-through me-2">
              {{ Number(product.price).toLocaleString("vi-VN") }} ₫
            </span>
            <span class="fw-bold text-danger fs-4">
              {{ Number(product.discount).toLocaleString("vi-VN") }} ₫
            </span>
            <span class="badge bg-success ms-2">
              -{{ Math.round(100 - (product.discount / product.price) * 100) }}%
            </span>
          </div>

          <p class="text-secondary">
            Tai nghe KaynStyle mang đến âm thanh sống động, thiết kế hiện đại,
            kết nối ổn định và pin bền bỉ — đồng hành cùng bạn trong mọi khoảnh
            khắc âm nhạc và phong cách.
          </p>

          <div class="mt-4 d-flex gap-3">
            <div @click="addToCart" class="btn btn-warning px-4 py-2"
              :class="{ 'disabled-btn': product.quantity === 0 }">
              <i class="fa fa-shopping-cart me-2"></i>
              {{ product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Đã hết hàng' }}
            </div>
            <button @click="toggleWishlist(product)" class="btn btn-outline-danger px-4 py-2"
              :class="{ 'active': isInWishlist(product.id) }">
              <i class="fa me-2" :class="isInWishlist(product.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
              {{ isInWishlist(product.id) ? 'Đã Thích' : 'Yêu Thích' }}
            </button>
          </div>

          <hr class="my-4" />

          <div>
            <h5 class="fw-bold mb-2">Mô tả sản phẩm</h5>
            <h2 class="fw-bold mt-4 mb-3 text-dark">
              Tai Nghe Gaming KaynStyle – Sức Mạnh Âm Thanh Dành Cho Game Thủ
            </h2>

            <h3 class="fw-semibold text-dark">
              Âm thanh sống động, chiến đấu chân thực
            </h3>
            <p class="text-muted">
              Tai nghe gaming <strong>KaynStyle</strong> mang đến chất âm vòm
              360° mạnh mẽ, tái hiện chân thực từng hiệu ứng trong game – từ
              tiếng bước chân, tiếng súng cho đến nhạc nền hoành tráng. Với
              driver công suất lớn, người dùng sẽ cảm nhận được không gian chiến
              đấu rõ ràng, chân thực và đầy cuốn hút.
            </p>

            <h3 class="fw-semibold text-dark">
              Thiết kế thoải mái, đậm chất game thủ
            </h3>
            <p class="text-muted">
              Sản phẩm được trang bị đệm tai mềm mại, ôm sát tai giúp đeo lâu
              không bị đau. Đèn LED RGB nổi bật tạo điểm nhấn cá tính, thể hiện
              phong cách riêng và năng lượng của mỗi game thủ.
            </p>

            <h3 class="fw-semibold text-dark">
              Kết nối linh hoạt, giao tiếp rõ ràng
            </h3>
            <p class="text-muted">
              Tai nghe có micro chống ồn đa hướng, truyền giọng nói rõ ràng và
              không bị nhiễu. Tương thích đa nền tảng – PC, laptop, điện thoại,
              máy chơi game – KaynStyle mang đến trải nghiệm mượt mà, ổn định
              trong mọi trận đấu.
            </p>
          </div>
        </div>
      </div>
      <div>
        <h3>Đánh Giá</h3>
        <p>(hiện chưa có đánh giá)</p>
      </div>
      <div class="mt-5">
        <h3 class="fw-bold mb-4">Sản phẩm liên quan</h3>
        <div v-if="relatedProducts.length" class="row row-cols-2 row-cols-md-4 g-4">
          <div v-for="item in relatedProducts" :key="item.id" class="col">
            <div class="card h-100 border-0 shadow-sm related-item" @click="router.push(`/productDetail/${item.id}`)">
              <img :src="item.image[0]" class="card-img-top" alt="related product" />
              <div class="card-body text-center">
                <h6 class="card-title text-truncate">{{ item.name }}</h6>
                <p class="text-danger fw-bold mb-0">
                  {{ Number(item.discount).toLocaleString("vi-VN") }} ₫
                </p>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-muted">Chưa có sản phẩm liên quan.</p>
      </div>
    </div>
  </div>

  <p v-else class="text-center text-muted mt-5">Đang Tải Sản Phẩm...</p>
</template>

<style scoped>
.main-img {
  height: 400px;
  object-fit: cover;
}

.small-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  transition: 0.3s;
}

.small-img:hover {
  transform: scale(1.05);
  border-color: #000;
}

button.btn-outline-dark:hover {
  background-color: #000;
  color: #fff;
  transition: 0.3s;
}

.related-item {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.related-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.related-item img {
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

.btn-outline-danger.active {
  background-color: #dc3545;
  color: white;
}

.disabled-btn {
  background-color: #cccccc !important;
  border-color: #cccccc !important;
  cursor: not-allowed;
  pointer-events: none;
}

@media (max-width: 768px) {
  .main-img {
    height: 300px;
  }
}
</style>
