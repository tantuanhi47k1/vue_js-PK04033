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

const comments = ref([]);
const newComment = ref('');
const userInfo = ref(null);

const reviews = ref([]);
const averageRating = ref(0);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
  headers: { 'ngrok-skip-browser-warning': 'true' },
};

// đánh giá
const fetchReviews = async () => {
  if (!route.params.id) return;
  try {
    const response = await axios.get(
      `${API_URL}/reviews?productId=${route.params.id}`,
      ngrokHeaderConfig
    );
    reviews.value = response.data;

    if (reviews.value.length > 0) {
      const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0);
      averageRating.value = (sum / reviews.value.length).toFixed(1);
    } else {
      averageRating.value = 0;
    }
  } catch (error) {
    console.error('Lỗi khi tải đánh giá:', error);
  }
};

// bl
const fetchApprovedComments = async () => {
  if (!route.params.id) return;
  try {
    const response = await axios.get(
      `${API_URL}/comments?productId=${route.params.id}&status=Đã duyệt&_sort=createdAt&_order=desc`,
      ngrokHeaderConfig
    );
    comments.value = response.data;
  } catch (error) {
    console.error('Lỗi khi tải bình luận:', error);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) {
    Swal.fire('Lỗi', 'Vui lòng nhập bình luận của bạn.', 'error');
    return;
  }

  if (!userInfo.value || !userInfo.value.id || !userInfo.value.fullname) {
    Swal.fire('Lỗi', 'Lỗi thông tin người dùng. Vui lòng đăng nhập lại.', 'error');
    return;
  }

  const commentData = {
    productId: route.params.id,
    userId: userInfo.value.id,
    userName: userInfo.value.fullname,
    content: newComment.value,
    createdAt: new Date().toISOString(),
    status: 'Chờ xử lý',
    imageUser: userInfo.value.avatar || ''
  };

  try {
    await axios.post(`${API_URL}/comments`, commentData, ngrokHeaderConfig);
    Swal.fire('Thành công', 'Bình luận của bạn đã được gửi và đang chờ phê duyệt!', 'success');
    newComment.value = '';
  } catch (error) {
    Swal.fire('Lỗi', 'Không thể gửi bình luận.', 'error');
  }
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

// sản phẩm liên quan
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

// ktra sp trong yt
const isInWishlist = (productId) => {
  return store.getters['wishlist/isInWishlist'](productId);
}

// thêm or xóa yt
const toggleWishlist = (product) => {
  if (isInWishlist(product.id)) {
    store.dispatch('wishlist/removeFromWishlist', product.id);
  } else {
    store.dispatch('wishlist/addToWishlist', product);
  }
}

onMounted(async () => {
  readProductDetail();
  readCategories();

  const user = localStorage.getItem('loggedInUser');
  if (user) {
    userInfo.value = JSON.parse(user);
  }

  await fetchApprovedComments();
  await fetchReviews();
});

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      readProductDetail();
      await fetchApprovedComments();
      await fetchReviews();
      window.scrollTo(0, 0);
    }
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

      <!-- đánh giá -->
      <div class="container mt-5">
        <div class="row">
          <div class="col-md-8 offset-md-2">
            <div class="reviews-section p-4 bg-white rounded shadow-sm">
              <h4 class="fw-bold mb-3 text-center">Đánh giá sản phẩm ({{ reviews.length }})</h4>

              <div class="text-center mb-4">
                <span v-if="averageRating > 0" class="text-warning fs-5">
                  <i v-for="star in 5" :key="star" class="bi me-1"
                    :class="star <= Math.round(averageRating) ? 'bi-star-fill' : 'bi-star'"></i>
                  <span class="ms-2 text-dark fw-semibold">
                    {{ averageRating }} / 5
                  </span>
                </span>
                <span v-else class="text-muted">Chưa có đánh giá nào</span>
              </div>

              <hr />

              <div v-if="reviews.length > 0">
                <div v-for="review in reviews" :key="review.id" class="review-item border-bottom pb-3 mb-3">
                  <h6 class="fw-bold mb-1">{{ review.userName }}</h6>
                  <div class="text-warning mb-2">
                    <i v-for="star in 5" :key="star" class="bi"
                      :class="star <= review.rating ? 'bi-star-fill' : 'bi-star'"></i>
                  </div>
                  <p class="mb-1">{{ review.content }}</p>
                  <small class="text-muted">
                    {{ new Date(review.createdAt).toLocaleString('vi-VN') }}
                  </small>
                </div>
              </div>

              <div v-else class="text-center text-muted">
                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- bình luận -->
      <div class="container mt-5">
        <div class="row">
          <div class="col-md-8 offset-md-2">
            <div v-if="userInfo" class="mb-4">
              <h4>Để lại bình luận</h4>
              <form @submit.prevent="submitComment">
                <div class="mb-3">
                  <textarea v-model="newComment" class="form-control" rows="4"
                    placeholder="Viết bình luận của bạn..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Gửi bình luận</button>
              </form>
            </div>

            <div v-else class="mb-4">
              <p>Vui lòng <router-link to="/login">đăng nhập</router-link> để để lại bình luận.</p>
            </div>

            <div class="comments-list">
              <h4>Bình luận ({{ comments.length }})</h4>
              <div v-if="comments.length > 0">
                <div v-for="comment in comments" :key="comment.id" class="card mb-3">
                  <div class="card-body"><img
                      :src="comment.imageUser || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'" alt="Avatar"
                      class="rounded-circle me-3" width="50" height="50" />
                    <h6 class="card-title fw-bold">{{ comment.userName }}</h6>
                    <p class="card-text">{{ comment.content }}</p>
                    <small class="text-muted">
                      {{ new Date(comment.createdAt).toLocaleString('vi-VN') }}
                    </small>
                  </div>
                </div>
              </div>
              <div v-else>
                <p>Chưa có bình luận nào cho sản phẩm này.</p>
              </div>
            </div>
          </div>
        </div>
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
