<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import { RouterLink, useRouter } from "vue-router";
import Swal from "sweetalert2";

const store = useStore();
const router = useRouter();

onMounted(() => {
  store.dispatch("cart/fetchCart");
});

const handlePaymentSuccess = () => {
  Swal.fire({
    icon: "success",
    title: "Thanh toán thành công!",
    text: "Cảm ơn bạn đã mua hàng ❤️",
    showConfirmButton: false,
    timer: 2000,
  });

  store.dispatch("cart/deleteAllCart");

  setTimeout(() => {
    router.push("/");
  }, 2000);
};

const cart = computed(() => store.getters["cart/cartItems"]);
const subtotal = computed(() => store.getters["cart/cartTotal"]);

const FREE_SHIP_THRESHOLD = 2000000;
const SHIPPING_FEE = 50000;

const isFreeShipping = computed(() => subtotal.value >= FREE_SHIP_THRESHOLD);

const total = computed(() =>
  isFreeShipping.value ? subtotal.value : subtotal.value + SHIPPING_FEE
);

const decrease = (item) => {
  store.dispatch("cart/decreaseQuantity", item.id);
};

const increase = (item) => {
  store.dispatch("cart/increaseQuantity", item.id);
};

const deleteCartItem = (itemId) => {
  Swal.fire({
    title: "Xác nhận xoá!",
    text: "Xoá sản phẩm này khỏi giỏ hàng?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  }).then(async (result) => {
    if (result.isConfirmed) {
      store.dispatch("cart/deleteCart", itemId);
      Swal.fire({
        icon: "success",
        title: "Xoá sản phẩm thành công!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
};

const deleteAllCart = () => {
  Swal.fire({
    title: "Bạn có chắc chắn muốn xoá tất cả sản phẩm khỏi giỏ hàng?",
    text: "Toàn bộ sản phẩm trong giỏ hàng sẽ bị xóa vĩnh viễn.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Xoá tất cả",
    cancelButtonText: "Huỷ",
  }).then((result) => {
    if (result.isConfirmed) {
      store.dispatch("cart/deleteAllCart");
      Swal.fire("Đã xoá!", "Tất cả sản phẩm đã được xoá khỏi giỏ hàng.", "success");
    }
  });
};
</script>

<template>
  <div class="container my-5">
    <h2 class="fw-bold mb-4 text-center" style="margin-top: 150px">🛒 Giỏ hàng</h2>

    <div class="text-center text-muted py-5" v-if="!cart.length">
      <i class="fa fa-shopping-cart fa-3x mb-3" style="color: aqua"></i>
      <p>Giỏ hàng của bạn đang trống</p>
      <RouterLink to="/" class="btn btn-warning">Tiếp Tục Mua Hàng</RouterLink>
    </div>

    <div class="row g-4" v-else>
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <table class="table align-middle mb-0" style="margin-top: 10px">
              <thead class="table-dark text-center">
                <tr>
                  <th>Sản Phẩm</th>
                  <th>Giá</th>
                  <th>Số Lượng</th>
                  <th>Tổng Tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr v-for="item in cart" :key="item.id">
                  <td>
                    <div class="d-flex align-items-center text-start">
                      <img :src="item.image[0]" class="rounded me-3 border" width="70" />
                      <div>
                        <h6 class="mb-0">{{ item.name }}</h6>
                        <small class="text-muted">Danh mục: {{ item.category }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-danger fw-semibold">{{
                      Number(item.discount).toLocaleString("vi-VN")
                    }}
                      ₫</span><br />
                    <small class="text-muted text-decoration-line-through">{{ Number(item.price).toLocaleString("vi-VN")
                      }} ₫</small>
                  </td>
                  <td>
                    <div class="input-group input-group-sm mx-auto" style="width: 120px">
                      <button @click="decrease(item)" class="btn btn-outline-dark">
                        -
                      </button>
                      <input :value="item.quantity" type="number" class="form-control text-center" min="1" max="100"
                        readonly />
                      <button @click="increase(item)" class="btn btn-outline-dark">
                        +
                      </button>
                    </div>
                  </td>
                  <td class="fw-semibold">
                    {{
                      (item.discount * item.quantity).toLocaleString("vi-VN")
                    }}
                    ₫
                  </td>
                  <td>
                    <button @click="deleteCartItem(item.id)" class="btn btn-sm btn-danger">
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="text-end mt-3" v-if="cart.length">
          <button @click="deleteAllCart" class="btn btn-outline-danger btn-sm">
            <i class="fa fa-trash me-1"></i> Xoá hết
          </button>
        </div>
      </div>

      <!-- Thông tin đơn hàng -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="fw-bold mb-3">Đơn hàng</h5>
            <div class="d-flex justify-content-between mb-2">
              <span>Tạm tính</span>
              <span>{{ subtotal.toLocaleString("vi-VN") }} ₫</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Phí vận chuyển</span>
              <span :class="isFreeShipping ? 'text-success' : 'text-danger'">
                {{ isFreeShipping ? 'Miễn phí' : SHIPPING_FEE.toLocaleString('vi-VN') + ' ₫' }}
              </span>
            </div>
            <p v-if="isFreeShipping" class="text-success small mt-2">
              🎉 Đơn hàng trên 2.000.000₫ được <b>miễn phí vận chuyển</b>!
            </p>
            <hr />
            <div class="d-flex justify-content-between fw-bold">
              <span>Tổng cộng</span>
              <span class="text-danger">
                {{ total.toLocaleString("vi-VN") }} ₫
              </span>
            </div>
            <button @click="handlePaymentSuccess" class="btn btn-success w-100 mt-4 fw-semibold">
              Thanh toán ngay
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  color: #222;
  letter-spacing: 0.5px;
}

table img {
  object-fit: cover;
  height: 70px;
}

input[type="number"] {
  border: 1px solid #ddd;
}

.card {
  border-radius: 12px;
  overflow: hidden;
  transition: 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>
