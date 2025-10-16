<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useStore } from 'vuex';
import Swal from 'sweetalert2';

const category = ref([]);
const products = ref([]);
const coupons = ref([]); // Thêm biến để lưu danh sách coupon
const store = useStore();

const scrollContainer = ref(null);
const scrollLeft = () =>
  scrollContainer.value.scrollBy({ left: -350, behavior: "smooth" });
const scrollRight = () =>
  scrollContainer.value.scrollBy({ left: 350, behavior: "smooth" });

const productScroll = ref(null);
const scrollProductLeft = () =>
  productScroll.value.scrollBy({ left: -350, behavior: "smooth" });
const scrollProductRight = () =>
  productScroll.value.scrollBy({ left: 350, behavior: "smooth" });

const readCategory = async () => {
  try {
    const res = await axios.get("http://localhost:3000/categories");
    category.value = res.data;
  } catch (err) {
    console.error("Error: ", err);
  }
};

const readProduct = async () => {
  try {
    const res = await axios.get("http://localhost:3000/products");
    products.value = res.data;
  } catch (err) {
    console.error("Error: ", err);
  }
};

// Hàm mới: Lấy danh sách coupon
const readCoupons = async () => {
  try {
    const res = await axios.get('http://localhost:3000/coupons');
    coupons.value = res.data;
  } catch (err) {
    console.error('Lỗi khi tải mã giảm giá:', err);
  }
};

const addToCart = (product) => {
  store.dispatch('cart/addProductToCart', product)
  Swal.fire({
    icon: 'success',
    title: 'Đã thêm vào giỏ hàng!',
    showConfirmButton: "OK",
    confirmButtonColor: '#000',
    text: 'Sản phâm đã được thêm vào giỏ hàng.',
    timer: 2000
  })
}

// Hàm mới: Sao chép mã coupon
const copyCoupon = (code) => {
  navigator.clipboard.writeText(code).then(() => {
    Swal.fire({
      icon: 'success',
      title: 'Đã sao chép!',
      text: `Mã giảm giá ${code} đã được sao chép.`,
      showConfirmButton: false,
      timer: 1500
    });
  }).catch(err => {
    console.error('Không thể sao chép: ', err);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Không thể sao chép mã giảm giá.',
    });
  });
};


onMounted(() => {
  readCategory();
  readProduct();
  readCoupons(); // Gọi hàm để lấy coupon
});
</script>

<template>
  <div class="home bg-light">
    <section
      class="hero position-relative d-flex align-items-center justify-content-center text-center text-white"
    >
      <img
        src="https://phukienvang.com/wp-content/uploads/2023/10/banner-tai-nghe-marshall-pkvaudio.jpg"
        class="position-absolute w-100 h-100 object-fit-cover"
        alt="banner"
      />
      <div
        class="overlay position-absolute w-100 h-100"
        style="background: rgba(0, 0, 0, 0.55)"
      ></div>
    </section>

    <section class="container my-5">
        <div class="text-center mb-5">
            <h2 class="fw-bold text-uppercase mb-2">Mã Giảm Giá Hấp Dẫn</h2>
            <p class="text-muted">
                Lưu lại mã để sử dụng cho lần mua sắm tiếp theo!
            </p>
        </div>
        <div class="row g-4 justify-content-center">
            <div class="col-md-6 col-lg-4" v-for="coupon in coupons" :key="coupon.id">
                <div class="coupon-card card border-0 shadow-sm h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary fw-bold">{{ coupon.title }}</h5>
                        <p class="card-text mb-2">Giảm: <strong class="text-danger">{{ coupon.discount }}%</strong></p>
                        <p class="card-text mb-2">Đơn tối thiểu: <strong>{{ Number(coupon.conditions).toLocaleString('vi-VN') }} ₫</strong></p>
                        <p class="card-text mb-auto">Hết hạn: <strong class="text-muted">{{ coupon.expiry }}</strong></p>
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                            <span class="coupon-code"><strong>{{ coupon.code }}</strong></span>
                            <button @click="copyCoupon(coupon.code)" class="btn btn-sm btn-outline-primary">Sao chép mã</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="container my-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold text-uppercase mb-2">Khám Phá Danh Mục</h2>
        <p class="text-muted">
          Khám phá các lựa chọn hàng đầu của chúng tôi cho mọi dịp
        </p>
      </div>

      <div class="row g-4 justify-content-center">
        <div
          class="col-6 col-md-4 col-lg-3"
          v-for="items in category"
          :key="items.id"
        >
          <div class="card border-0 shadow-sm overflow-hidden category-card">
            <div class="position-relative">
              <img
                :src="items.image"
                class="w-100"
                style="height: 250px; object-fit: cover"
              />
            </div>
            <div class="p-3 text-center">
              <h6 class="fw-semibold" style="cursor: pointer">
                {{ items.nameCategory }}
              </h6>
              <small class="text-muted">{{ items.moTa }}</small>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container my-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold text-uppercase mb-2">Sản Phẩm Bán Chạy</h2>
        <p class="text-muted">
          Những sản phẩm bán chạy nhất được mọi người yêu thích
        </p>
      </div>

      <div class="row g-4">
        <div
          class="col-6 col-md-4 col-lg-3"
          v-for="item in products"
          :key="item.id"
        >
          <div class="card border-0 shadow-sm h-100 product-card">
            <router-link
              :to="`/productDetail/${item.id}`"
              class="text-decoration-none text-dark"
            >
              <div class="position-relative">
                <img
                  :src="item.image[0]"
                  class="w-100"
                  style="height: 260px; object-fit: cover"
                />
                <span
                  v-if="item.discount < item.price"
                  class="badge bg-danger position-absolute top-0 start-0 m-2"
                  >-{{ Math.round(100 - (item.discount / item.price) * 100) }}%</span
                >
              </div>

              <div class="card-body text-center">
                <h6 class="fw-semibold mb-1">{{ item.name }}</h6>

                <template v-if="item.discount < item.price">
                  <p class="text-muted text-decoration-line-through small mb-0">
                    {{ Number(item.price).toLocaleString("vi-VN") }} ₫
                  </p>
                  <p class="fw-bold text-danger mb-1">
                    {{ Number(item.discount).toLocaleString("vi-VN") }} ₫
                  </p>
                </template>

                <template v-else>
                  <p class="fw-bold text-danger mb-1">
                    {{ Number(item.price).toLocaleString("vi-VN") }} ₫
                  </p>
                </template>
              </div>
            </router-link>

            <div class="text-center pb-3">
              <button @click="addToCart(item)"
                class="btn btn-dark btn-sm rounded-pill mt-2"
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* CSS CŨ CỦA BẠN (GIỮ NGUYÊN) */
.hero {
  position: relative;
  background: url("https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80")
    center/cover no-repeat;
  height: 80vh;
}
.hero .overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}
.hero .content {
  position: relative;
  z-index: 2;
}
.scroll-btn {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  background: #111;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: 0.3s;
  z-index: 5;
}
.scroll-btn:hover {
  background: #000;
  transform: translateY(-50%) scale(1.1);
}
.scroll-btn.left {
  left: -10px;
}
.scroll-btn.right {
  right: -10px;
}
.category-scroll {
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.category-scroll::-webkit-scrollbar {
  display: none;
}
.category-item {
  width: 260px;
}
.image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}
.image-wrapper img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.4s ease, filter 0.3s ease;
}
.image-wrapper:hover img {
  transform: scale(1.08);
  filter: brightness(0.7);
}
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.image-wrapper:hover .overlay {
  opacity: 1;
}
.product-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}
.product-card img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  transition: transform 0.4s ease;
  border-bottom: 1px solid #f1f1f1;
}
.product-card:hover img {
  transform: scale(1.07);
}
.product-card h6 {
  color: #222;
  font-size: 1rem;
  margin-bottom: 6px;
  transition: color 0.3s ease;
}
.product-card:hover h6 {
  color: #007bff; /* xanh nước biển */
}
.product-card p {
  margin: 0;
}
.product-card .text-muted {
  color: #999 !important;
}
.product-card .fw-bold {
  font-size: 1rem;
  color: #007bff; /* xanh nước biển cho giá giảm */
}
.product-card .btn {
  background-color: #007bff !important; /* xanh nước biển */
  border: none;
  color: #fff;
  font-weight: 500;
  border-radius: 50px;
  padding: 6px 14px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.product-card .btn:hover {
  background-color: #0056b3 !important; /* đậm hơn khi hover */
  transform: scale(1.05);
}
section h2 {
  color: #111;
  text-transform: uppercase;
  letter-spacing: 1px;
}
/* CSS MỚI CHO COUPON */
.coupon-card {
    background-color: #f8f9fa;
    border: 1px dashed #007bff;
    border-radius: 12px;
    transition: all 0.3s ease;
}
.coupon-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
    border-color: #0056b3;
}
.coupon-code {
    background-color: #e9ecef;
    border: 1px solid #ced4da;
    padding: 6px 12px;
    border-radius: 6px;
    font-family: 'Courier New', Courier, monospace;
    letter-spacing: 1px;
}
</style>