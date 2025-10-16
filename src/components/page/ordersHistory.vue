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

const getStatusClass = (status) => {
  switch (status) {
    case 'Chờ xử lý': return 'text-primary';
    case 'Đang giao': return 'text-info';
    case 'Đã giao': return 'text-success';
    case 'Đã huỷ': return 'text-danger';
    default: return 'text-muted';
  }
};

const fetchOrders = async () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (loggedInUser) {
    try {
      const { data } = await axios.get(`http://localhost:3000/orders?userId=${loggedInUser.id}`);
      orders.value = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    } catch (err)      {
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
      await axios.patch(`http://localhost:3000/orders/${orderId}`, { status: 'Cancelled' });

      fetchOrders();

      Swal.fire(
        'Đã huỷ!',
        'Đơn hàng của bạn đã được huỷ thành công.',
        'success'
      );
    } catch (err) {
      console.error('Lỗi khi huỷ đơn hàng:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể huỷ đơn hàng. Vui lòng thử lại sau.'
      });
    }
  }
};

// mua lại
const buyAgain = (order) => {
  if (confirm('Bạn có muốn thêm tất cả sản phẩm của đơn hàng này vào giỏ hàng không?')) {
    order.products.forEach(product => {
      store.dispatch('cart/addToCart', {
        id: product.id,
        name: product.name,
        category: product.category || '',
        price: product.price || product.discount,
        discount: product.discount || product.price,
        image: Array.isArray(product.image) ? product.image : [product.image],
        quantity: product.quantity || 1
      });
    });

    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Tất cả sản phẩm đã được thêm lại vào giỏ hàng.',
      timer: 2000,
      showConfirmButton: false
    });

    router.push('/cart');
  }
};


onMounted(fetchOrders);

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
            <hr>
            <div class="d-flex justify-content-end">
              <button
                v-if="order.status === 'Chờ xử lý'"
                @click="cancelOrder(order.id)"
                class="btn btn-danger me-2">
                Huỷ đơn
              </button>
              <button
                @click="buyAgain(order)"
                class="btn btn-primary">
                Mua lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>