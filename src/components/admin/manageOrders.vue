<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const orders = ref([]);
const statuses = ['Chờ xử lý', 'Đang vận chuyển', 'Đã giao', 'Đã hủy'];

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const selectedOrder = ref(null);
const showDetail = ref(false);

// tải đh
const fetchOrders = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/orders`, ngrokHeaderConfig);
    orders.value = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  } catch (err) {
    console.error("Lỗi khi tải đơn hàng:", err);
  }
};

// update trạng thái đh
const updateStatus = async (order, newStatus) => {
  try {
    if (newStatus === 'Đã hủy' && order.status !== 'Đã hủy') {
      for (const item of order.products) {
        try {
          const response = await axios.get(`${API_URL}/products/${item.id}`, ngrokHeaderConfig);
          const product = response.data;
          const newQuantity = product.quantity + item.quantity;

          await axios.patch(
            `${API_URL}/products/${item.id}`,
            { quantity: newQuantity },
            ngrokHeaderConfig
          );
        } catch (error) {
          console.error(`Lỗi khi hoàn lại số lượng cho sản phẩm ${item.id}:`, error);
        }
      }
    }

    await axios.patch(
      `${API_URL}/orders/${order.id}`,
      { status: newStatus },
      ngrokHeaderConfig
    );

    order.status = newStatus;
    Swal.fire("Thành công", "Cập nhật trạng thái thành công!", "success");
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái:", err);
    Swal.fire("Lỗi", "Cập nhật trạng thái thất bại!", "error");
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Chờ xử lý': return 'bg-processing';
    case 'Đang vận chuyển': return 'bg-shipped';
    case 'Đã giao': return 'bg-delivered';
    case 'Đã hủy': return 'bg-cancelled';
    default: return 'bg-secondary';
  }
};

const viewDetails = (order) => {
  selectedOrder.value = order;
  showDetail.value = true;
};

const closeDetails = () => {
  showDetail.value = false;
  selectedOrder.value = null;
};

onMounted(fetchOrders);
</script>

<template>
  <div class="container-fluid p-4">
    <h3 class="fw-bold mb-4">Quản lý đơn hàng</h3>
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td>{{ order.customerInfo.fullname }}</td>
              <td>{{ new Date(order.orderDate).toLocaleString('vi-VN') }}</td>
              <td class="fw-bold">{{ order.total.toLocaleString('vi-VN') }} ₫</td>
              <td>
                <span :class="['badge', getStatusClass(order.status)]">{{ order.status }}</span>
              </td>
              <td class="d-flex gap-2">
                <select class="form-select form-select-sm w-auto"
                        @change="updateStatus(order, $event.target.value)">
                  <option :selected="order.status === status"
                          v-for="status in statuses"
                          :key="status"
                          :value="status">
                    {{ status }}
                  </option>
                </select>
                <button class="btn btn-sm btn-outline-primary" @click="viewDetails(order)">
                  Xem
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showDetail" class="modal-overlay" @click.self="closeDetails">
      <div class="modal-content">
        <h5 class="fw-bold mb-3">Chi tiết đơn hàng #{{ selectedOrder.id }}</h5>
        <p><strong>Khách hàng:</strong> {{ selectedOrder.customerInfo.fullname }}</p>
        <p><strong>Ngày đặt:</strong> {{ new Date(selectedOrder.orderDate).toLocaleString('vi-VN') }}</p>
        <p><strong>Trạng thái:</strong> {{ selectedOrder.status }}</p>
        <p><strong>Tổng tiền:</strong> {{ selectedOrder.total.toLocaleString('vi-VN') }} ₫</p>

        <h6 class="fw-bold mt-3">Danh sách sản phẩm</h6>
        <table class="table table-sm table-bordered mt-2">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in selectedOrder.products" :key="p.id">
              <td>{{ p.name }}</td>
              <td>{{ p.quantity }}</td>
              <td>{{ p.price.toLocaleString('vi-VN') }} ₫</td>
            </tr>
          </tbody>
        </table>

        <div class="text-end mt-3">
          <button class="btn btn-secondary" @click="closeDetails">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge.bg-processing { background-color: #0d6efd; color: white; }
.badge.bg-shipped { background-color: #0dcaf0; color: black; }
.badge.bg-delivered { background-color: #198754; color: white; }
.badge.bg-cancelled { background-color: #dc3545; color: white; }
.badge.bg-secondary { background-color: #6c757d; color: white; }

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}
</style>
