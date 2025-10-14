<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const orders = ref([]);
const statuses = ['Chờ xử lý', 'Đang vận chuyển', 'Đã giao', 'Đã hủy'];

const fetchOrders = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/orders');
    orders.value = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  } catch (err) {
    console.error("Lỗi khi tải đơn hàng:", err);
  }
};

const updateStatus = async (order, newStatus) => {
  try {
    await axios.patch(`http://localhost:3000/orders/${order.id}`, { status: newStatus });
    order.status = newStatus;
    Swal.fire('Thành công', 'Cập nhật trạng thái thành công!', 'success');
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái:", err);
    Swal.fire('Thất bại', 'Có lỗi xảy ra.', 'error');
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
              <td>
                <select class="form-select form-select-sm" @change="updateStatus(order, $event.target.value)">
                  <option :selected="order.status === status" v-for="status in statuses" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
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
</style>