<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const orders = ref([]);
const isLoading = ref(true);
const store = useStore();
const router = useRouter();

// đánh giá
const userReviews = ref([]);
const showReviewModal = ref(false);
const productToReview = ref(null);
const reviewRating = ref(0);
const reviewText = ref('');
const currentOrderId = ref(null);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = { headers: { 'ngrok-skip-browser-warning': 'true' } };

// class trạng thái
const getStatusClass = (status) => {
  switch (status) {
    case 'Chờ xử lý': return 'text-primary';
    case 'Đang giao': return 'text-info';
    case 'Đã giao': return 'text-success';
    case 'Đã huỷ': return 'text-danger';
    default: return 'text-muted';
  }
};

// lấy danh sách đơn hàng
const fetchOrders = async () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (loggedInUser) {
    try {
      const { data } = await axios.get(`${API_URL}/orders?userId=${loggedInUser.id}`, ngrokHeaderConfig);
      orders.value = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đơn hàng:", err);
    }
  }
  isLoading.value = false;
};

// huỷ đơn
const cancelOrder = async (orderId) => {
  const result = await Swal.fire({
    title: 'Bạn chắc chắn muốn huỷ?',
    text: "Hành động này không thể hoàn tác!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Đồng ý huỷ!',
    cancelButtonText: 'Không'
  });

  if (result.isConfirmed) {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}`, { status: 'Đã huỷ' }, ngrokHeaderConfig);
      fetchOrders();
      Swal.fire('Đã huỷ!', 'Đơn hàng của bạn đã được huỷ thành công.', 'success');
    } catch (err) {
      console.error('Lỗi khi huỷ đơn hàng:', err);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể huỷ đơn hàng. Vui lòng thử lại sau.' });
    }
  }
};

// mua lại
const buyAgain = async (order) => {
  const result = await Swal.fire({
    title: 'Mua lại đơn hàng này?',
    text: 'Tất cả sản phẩm trong đơn sẽ được thêm lại vào giỏ hàng của bạn.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#000',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Mua lại',
    cancelButtonText: 'Huỷ'
  });

  if (result.isConfirmed) {
    for (const product of order.products) {
      await store.dispatch('cart/addToCart', {
        id: product.id,
        name: product.name,
        category: product.category || '',
        price: product.price || product.discount,
        discount: product.discount || product.price,
        image: Array.isArray(product.image) ? product.image : [product.image],
        quantity: product.quantity || 1
      });
    }

    Swal.fire({
      icon: 'success',
      title: 'Đã thêm lại vào giỏ hàng!',
      text: 'Bạn có thể kiểm tra trong giỏ hàng 💖',
      timer: 2000,
      showConfirmButton: false
    });

    router.push('/cart');
  }
};

const hasReviewed = (productId, orderId) =>
  userReviews.value.some(r => r.productId === productId && r.orderId === orderId);

const openReviewModal = (product, orderId) => {
  productToReview.value = product;
  currentOrderId.value = orderId;
  reviewRating.value = 0;
  reviewText.value = '';
  showReviewModal.value = true;
};

const submitReview = async () => {
  const userInfo = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!userInfo) {
    Swal.fire('Lỗi', 'Bạn cần đăng nhập để đánh giá.', 'error');
    return;
  }

  if (reviewRating.value === 0 || reviewText.value.trim() === "") {
    Swal.fire('Lỗi', 'Vui lòng chọn số sao và nhập nội dung.', 'error');
    return;
  }

  const reviewData = {
    productId: productToReview.value.id,
    orderId: currentOrderId.value,
    userId: userInfo.id,
    userName: userInfo.fullname,
    userAvatar: userInfo.avatar || '/images/default-avatar.png',
    rating: reviewRating.value,
    content: reviewText.value.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    const { data } = await axios.post(`${API_URL}/reviews`, reviewData, ngrokHeaderConfig);
    userReviews.value.unshift(data);
    showReviewModal.value = false;
    Swal.fire('Cảm ơn bạn!', 'Đánh giá đã được gửi.', 'success');
  } catch (error) {
    Swal.fire('Lỗi', 'Không thể gửi đánh giá.', 'error');
  }
};

onMounted(async () => {
  await fetchOrders();
  const userInfo = JSON.parse(localStorage.getItem('loggedInUser'));
  if (userInfo) {
    try {
      const { data } = await axios.get(`${API_URL}/reviews?userId=${userInfo.id}`, ngrokHeaderConfig);
      userReviews.value = data;
    } catch (error) {
      console.error('Lỗi tải đánh giá đã gửi:', error);
    }
  }
});
</script>

<template>
  <div class="container my-5">
    <h2 class="fw-bold mb-4 text-center">Lịch Sử Đơn Hàng</h2>

    <div v-if="isLoading" class="text-center">
      <p>Đang tải...</p>
    </div>
    <div v-else-if="orders.length === 0" class="text-center">
      <p>Bạn chưa có đơn hàng nào.</p>
    </div>

    <div v-else class="accordion" id="orderHistoryAccordion">
      <div v-for="(order, index) in orders" :key="order.id" class="accordion-item mb-3 border-0 shadow-sm">
        <h2 class="accordion-header" :id="'heading' + index">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index"
            aria-expanded="true" :aria-controls="'collapse' + index">
            <div class="d-flex justify-content-between w-100">
              <span>Đơn hàng #{{ order.id }} - {{ new Date(order.orderDate).toLocaleDateString('vi-VN') }}</span>
              <span :class="getStatusClass(order.status)" class="fw-bold me-3">{{ order.status }}</span>
            </div>
          </button>
        </h2>

        <div :id="'collapse' + index" class="accordion-collapse collapse show" :aria-labelledby="'heading' + index">
          <div class="accordion-body">
            <p><strong>Người nhận:</strong> {{ order.customerInfo.fullname }}</p>
            <p><strong>Địa chỉ:</strong> {{ order.customerInfo.address }}</p>
            <p><strong>Tổng tiền:</strong> <span class="text-danger fw-bold">{{ order.total.toLocaleString('vi-VN') }}
                ₫</span></p>
            <hr />

            <h6>Chi tiết sản phẩm:</h6>
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li v-for="item in order.products" :key="item.id" class="list-group-item d-flex flex-column">
                  <div class="d-flex justify-content-between align-items-center w-100">
                    <div class="d-flex align-items-center">
                      <img :src="Array.isArray(item.image) ? item.image[0] : item.image" alt="" width="50"
                        class="me-3 rounded" />
                      <div>
                        <div class="fw-semibold">{{ item.name }}</div>
                        <small class="text-muted">Mã: {{ item.id }}</small>
                      </div>
                    </div>

                    <div class="text-end">
                      <div class="mb-1">
                        <span class="fw-semibold">{{ item.quantity }}</span> x
                        <span class="text-danger fw-bold">{{ Number(item.discount || item.price).toLocaleString('vi-VN')
                          }} ₫</span>
                      </div>

                      <div class="d-inline-block">
                        <button v-if="order.status === 'Đã giao' && !hasReviewed(item.id, order.id)"
                          @click="openReviewModal(item, order.id)" class="btn btn-outline-primary btn-sm ms-1">
                          Đánh giá
                        </button>

                        <span v-if="order.status === 'Đã giao' && hasReviewed(item.id, order.id)"
                          class="ms-2 badge bg-light text-dark">Đã đánh giá</span>
                      </div>
                    </div>
                  </div>

                  <!-- phần hiển thị đánh giá -->
                  <div v-for="review in userReviews.filter(r => r.productId === item.id && r.orderId === order.id)"
                    :key="review.id" class="mt-3 ps-4 border-start review-block">
                    <div class="d-flex align-items-start">
                      <img :src="review.userAvatar" alt="avatar" class="rounded-circle me-3" width="44" height="44" />
                      <div class="w-100">
                        <div class="d-flex align-items-center justify-content-between">
                          <h6 class="mb-1 fw-semibold">{{ review.userName }}</h6>
                          <small class="text-muted">{{ new Date(review.createdAt).toLocaleString('vi-VN') }}</small>
                        </div>
                        <div class="text-warning mb-1 star-row">
                          <i v-for="n in 5" :key="n" class="bi"
                            :class="n <= review.rating ? 'bi-star-fill' : 'bi-star'"></i>
                        </div>
                        <p class="mb-1">{{ review.content }}</p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <hr />

            <div class="d-flex justify-content-end">
              <button v-if="order.status === 'Chờ xử lý'" @click="cancelOrder(order.id)" class="btn btn-danger me-2">Huỷ
                đơn</button>
              <button @click="buyAgain(order)" class="btn btn-primary">Mua lại</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- đánh giá -->
    <div v-if="showReviewModal" class="modal-backdrop" @click.self="showReviewModal = false">
      <div class="modal-dialog modal-dialog-centered modal-custom" style="background-color: gray; padding: 10px;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" style="color: palegreen;">Đánh giá: {{ productToReview?.name || '' }}</h5>
            <button type="button" class="btn-close" @click="showReviewModal = false"></button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitReview">
              <div class="mb-3">
                <label class="form-label" style="color: whitesmoke;">Chọn số sao</label>
                <div class="star-select">
                  <i v-for="s in 5" :key="s" class="bi"
                    :class="s <= reviewRating ? 'bi-star-fill active-star' : 'bi-star'"
                    @click.stop="reviewRating = s"></i>
                  <span class="ms-2" style="color: orange;">{{ reviewRating }} / 5</span>
                </div>
              </div>

              <div class="mb-3">
                <label for="reviewText" class="form-label" style="color: gold;">Nội dung đánh giá</label>
                <textarea id="reviewText" v-model="reviewText" class="form-control" rows="4"
                  placeholder="Chia sẻ cảm nhận của bạn..."></textarea>
              </div>

              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-danger me-2" @click="showReviewModal = false">Hủy</button>
                <button type="submit" class="btn btn-success">Gửi đánh giá</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-block {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 10px 15px;
}

.star-row i {
  font-size: 1.1rem;
  color: #ffc107;
}

.active-star {
  color: #ffc107;
}

.star-select {
  display: flex;
  align-items: center;
}

.star-select i {
  font-size: 1.6rem;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
}

.star-select i:hover,
.star-select i.active-star,
.star-select i:hover~i {
  color: #ffc107;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-custom {
  max-width: 500px;
  width: 100%;
}

</style>
