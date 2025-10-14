<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const store = useStore();
const router = useRouter();

const userInfo = ref({
  fullname: '',
  address: '',
  phone: '',
  note: ''
});
const paymentMethod = ref('cod');
const couponCode = ref('');
const discount = ref(0);

const cart = computed(() => store.getters['cart/cartItems']);
const subtotal = computed(() => store.getters['cart/cartTotal']);
const total = computed(() => {
  const finalTotal = subtotal.value - discount.value;
  return finalTotal > 0 ? finalTotal : 0;
});

onMounted(() => {
  store.dispatch('cart/fetchCart');
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (loggedInUser) {
    userInfo.value.fullname = loggedInUser.fullname;
    userInfo.value.address = loggedInUser.address;
    userInfo.value.phone = loggedInUser.phone;
  }
});

const applyCoupon = async () => {
  if (!couponCode.value) return;
  try {
    const { data: coupons } = await axios.get(`http://localhost:3000/coupons?code=${couponCode.value}`);
    const coupon = coupons[0];

    if (coupon) {
      if (coupon.discountPercent) {
        discount.value = (subtotal.value * coupon.discountPercent) / 100;
      } else if (coupon.discountAmount) {
        discount.value = coupon.discountAmount;
      }
      Swal.fire('Thành công', 'Áp dụng mã giảm giá thành công!', 'success');
    } else {
      discount.value = 0;
      Swal.fire('Thất bại', 'Mã giảm giá không hợp lệ!', 'error');
    }
  } catch (err) {
    console.error('Lỗi khi áp dụng mã:', err);
  }
};

const placeOrder = async () => {
  if (!userInfo.value.fullname || !userInfo.value.address || !userInfo.value.phone) {
    Swal.fire('Lỗi', 'Vui lòng điền đầy đủ thông tin giao hàng.', 'error');
    return;
  }

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const orderDetails = {
    userId: loggedInUser.id,
    customerInfo: userInfo.value,
    products: cart.value,
    subtotal: subtotal.value,
    discount: discount.value,
    note: userInfo.value.note,
    total: total.value,
    paymentMethod: paymentMethod.value,
    status: 'Chờ xử lý',
    orderDate: new Date().toISOString()
  };

  try {
    await axios.post('http://localhost:3000/orders', orderDetails);

    await store.dispatch('cart/deleteAllCart');

    Swal.fire({
      icon: 'success',
      title: 'Đặt hàng thành công!',
      text: 'Cảm ơn bạn đã mua hàng.',
    }).then(() => {
      router.push('/ordersHistory');
    });

  } catch (err) {
    console.error('Lỗi khi đặt hàng:', err);
    Swal.fire('Lỗi', 'Đã có lỗi xảy ra, vui lòng thử lại.', 'error');
  }
};
</script>

<template>
  <div class="container my-5">
    <h2 class="fw-bold mb-4 text-center">Thanh Toán</h2>
    <div v-if="cart.length === 0" class="text-center">
      <p>Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm để thanh toán.</p>
    </div>
    <div v-else class="row g-5">
      <div class="col-md-7">
        <h4 class="mb-3 fw-semibold">Thông tin giao hàng</h4>
        <div class="card p-4 shadow-sm border-0">
          <div class="mb-3">
            <label class="form-label">Họ và tên</label>
            <input type="text" v-model="userInfo.fullname" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Địa chỉ</label>
            <input type="text" v-model="userInfo.address" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Số điện thoại</label>
            <input type="tel" v-model="userInfo.phone" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Ghi chú (tùy chọn)</label>
            <textarea v-model="userInfo.note" class="form-control" rows="3"></textarea>
          </div>
        </div>

        <h4 class="mt-4 mb-3 fw-semibold">Phương thức thanh toán</h4>
        <div class="card p-4 shadow-sm border-0">
          <div class="form-check">
            <input class="form-check-input" type="radio" v-model="paymentMethod" value="cod" id="cod">
            <label class="form-check-label" for="cod">
              Thanh toán khi nhận hàng (COD)
            </label>
          </div>
          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" v-model="paymentMethod" value="vnpay" id="vnpay" disabled>
            <label class="form-check-label" for="vnpay">
              VNPAY (Đang phát triển)
            </label>
          </div>
        </div>
      </div>

      <div class="col-md-5">
        <h4 class="mb-3 fw-semibold">Tóm tắt đơn hàng</h4>
        <div class="card p-4 shadow-sm border-0">
          <div v-for="item in cart" :key="item.id" class="d-flex justify-content-between mb-2">
            <span>{{ item.name }} x {{ item.quantity }}</span>
            <span>{{ (item.discount * item.quantity).toLocaleString('vi-VN') }} ₫</span>
          </div>
          <hr>
          <div class="d-flex justify-content-between mb-2">
            <strong>Tạm tính</strong>
            <strong>{{ subtotal.toLocaleString('vi-VN') }} ₫</strong>
          </div>
          <div class="d-flex justify-content-between text-success mb-2" v-if="discount > 0">
            <strong>Giảm giá</strong>
            <strong>- {{ discount.toLocaleString('vi-VN') }} ₫</strong>
          </div>
          <hr>
          <div class="d-flex justify-content-between fw-bold fs-5">
            <span>Tổng cộng</span>
            <span class="text-danger">{{ total.toLocaleString('vi-VN') }} ₫</span>
          </div>
          <div class="input-group mt-4">
            <input type="text" v-model="couponCode" class="form-control" placeholder="Nhập mã khuyến mãi">
            <button @click="applyCoupon" class="btn btn-dark">Áp dụng</button>
          </div>
          <button @click="placeOrder" class="btn btn-success w-100 mt-3 fw-bold py-2">
            ĐẶT HÀNG
          </button>
        </div>
      </div>
    </div>
  </div>
</template>