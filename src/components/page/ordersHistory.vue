<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const orders = ref([]);
const isLoading = ref(true);

const getStatusClass = (status) => {
  switch (status) {
    case 'Processing': return 'text-primary';
    case 'Shipped': return 'text-info';
    case 'Delivered': return 'text-success';
    case 'Cancelled': return 'text-danger';
    default: return 'text-muted';
  }
};

onMounted(async () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (loggedInUser) {
    try {
      const { data } = await axios.get(`http://localhost:3000/orders?userId=${loggedInUser.id}`);
      orders.value = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đơn hàng:", err);
    }
  }
  isLoading.value = false;
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
          <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index" aria-expanded="true" :aria-controls="'collapse' + index">
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
            <p><strong>Tổng tiền:</strong> <span class="text-danger fw-bold">{{ order.total.toLocaleString('vi-VN') }} ₫</span></p>
            <hr>
            <h6>Chi tiết sản phẩm:</h6>
            <ul>
              <li v-for="product in order.products" :key="product.id">
                {{ product.name }} (x{{ product.quantity }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>