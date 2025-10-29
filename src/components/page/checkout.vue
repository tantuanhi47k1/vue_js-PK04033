<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const store = useStore();
const router = useRouter();

const userInfo = ref({
  fullname: "",
  address: "",
  phone: "",
  note: "",
});
const paymentMethod = ref("cod"); // mặc định là cod :)
const couponCode = ref(""); // mã giảm giá ng dung` nhập
const discount = ref(0); // tiền đc giảm
const appliedCoupon = ref(null); // mã giảm giá đã áp dụng
const shippingFee = ref(0);

const cart = computed(() => store.getters["cart/cartItems"]);
const subtotal = computed(() => store.getters["cart/cartTotal"]);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
  headers: { "ngrok-skip-browser-warning": "true" },
};

const ADMIN_EMAIL = "ttuanndz47@gmail.com"; 
const MAIL_SERVER_URL = "http://localhost:3001/send-mail";

const total = computed(() => {
  const finalTotal = subtotal.value - discount.value + shippingFee.value;
  return finalTotal > 0 ? finalTotal : 0;
});

onMounted(() => {
  store.dispatch("cart/fetchCart");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser) {
    userInfo.value.fullname = loggedInUser.fullname;
    userInfo.value.address = loggedInUser.address;
    userInfo.value.phone = loggedInUser.phone;
  }
  updateShippingFee();
});

watch(subtotal, () => {
  updateShippingFee();
});

watch(subtotal, (newValue) => {
  updateShippingFee();
  if (newValue === 0) {
    discount.value = 0;
    appliedCoupon.value = null;
    couponCode.value = "";
  }
});

watch(cart, () => {
  discount.value = 0;
  couponCode.value = "";
  appliedCoupon.value = null;
});

// phí ship
const updateShippingFee = () => {
  const value = subtotal.value;
  if (value === 0) {
    shippingFee.value = 0;
  } else if (value >= 2000000) {
    shippingFee.value = 0;
  } else {
    shippingFee.value = 50000;
  }
};

//
const applyCoupon = async () => {
  if (!couponCode.value) {
    Swal.fire("Cảnh báo", "Vui lòng nhập mã giảm giá!", "warning");
    return;
  }

  try {
    const { data: coupons } = await axios.get(
      `${API_URL}/coupons?code=${couponCode.value}`,
      ngrokHeaderConfig
    );
    const coupon = coupons[0];

    if (!coupon) {
      Swal.fire("Lỗi", "Mã giảm giá không hợp lệ!", "error");
      discount.value = 0;
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (coupon.expiry && coupon.expiry < today) {
      Swal.fire("Hết hạn", "Mã giảm giá này đã hết hạn!", "warning");
      discount.value = 0;
      return;
    }

    if (coupon.conditions && subtotal.value < coupon.conditions) {
      Swal.fire(
        "Không đủ điều kiện",
        `Đơn hàng phải từ ${coupon.conditions.toLocaleString(
          "vi-VN"
        )}₫ mới dùng mã này!`,
        "info"
      );
      discount.value = 0;
      return;
    }

    discount.value = Math.floor((subtotal.value * coupon.discount) / 100);
    appliedCoupon.value = coupon;

    Swal.fire(
      "Thành công",
      `Áp dụng mã giảm ${coupon.discount}% thành công!`,
      "success"
    );
  } catch (err) {
    console.error("Lỗi khi áp dụng mã:", err);
    Swal.fire("Lỗi", "Không thể áp dụng mã giảm giá.", "error");
  }
};

const sendEmail = async (mailData) => {
  try {
    await axios.post(MAIL_SERVER_URL, {
      to: mailData.to,
      subject: mailData.subject,
      html: mailData.html,
    });
    console.log(`Email xác nhận đã gửi tới ${mailData.to}`);
  } catch (error) {
    console.error(`Lỗi khi gửi mail tới ${mailData.to}:`, error);
  }
};

const formatOrderToHTML = (order) => {
  const formatCurrency = (value) => (value || 0).toLocaleString("vi-VN") + " ₫";
  const orderDate = new Date(order.orderDate).toLocaleString("vi-VN");

  const productRows = order.products
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; vertical-align: top;">
        <img src="${item.image[0]}" alt="${
        item.name
      }" width="60" style="border-radius: 8px; margin-right: 12px; vertical-align: middle;">
        ${item.name}
      </td>
      <td style="padding: 12px; vertical-align: top; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 12px; vertical-align: top; text-align: right; font-weight: 500;">${formatCurrency(
        (item.discount || item.price) * item.quantity
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #f9f9f9; padding: 24px; text-align: center;">
        <h1 style="color: #333; margin: 0;">KaynStyle</h1>
        <h2 style="color: #555; margin: 10px 0 0; font-weight: 500;">Cảm ơn bạn đã đặt hàng!</h2>
      </div>
      
      <div style="padding: 24px; line-height: 1.6;">
        <p>Xin chào <strong>${order.customerInfo.fullname}</strong>,</p>
        <p>Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ xử lý và giao hàng cho bạn trong thời gian sớm nhất.</p>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Thông tin đơn hàng</h3>
          <p style="margin: 4px 0;"><strong>Mã đơn hàng:</strong> ${
            order.id || "Đang xử lý"
          }</p>
          <p style="margin: 4px 0;"><strong>Ngày đặt hàng:</strong> ${orderDate}</p>
          <p style="margin: 4px 0;"><strong>Trạng thái:</strong> ${
            order.status
          }</p>
          <p style="margin: 4px 0;"><strong>Phương thức thanh toán:</strong> ${
            order.paymentMethod
          }</p>
        </div>

        <h3 style="margin-top: 24px;">Thông tin giao hàng</h3>
        <p style="margin: 4px 0;"><strong>Người nhận:</strong> ${
          order.customerInfo.fullname
        }</p>
        <p style="margin: 4px 0;"><strong>Địa chỉ:</strong> ${
          order.customerInfo.address
        }</p>
        <p style="margin: 4px 0;"><strong>Số điện thoại:</strong> ${
          order.customerInfo.phone
        }</p>
        ${
          order.note
            ? `<p style="margin: 4px 0;"><strong>Ghi chú:</strong> ${order.note}</p>`
            : ""
        }

        <h3 style="margin-top: 24px; border-bottom: 2px solid #eee; padding-bottom: 8px;">Sản phẩm đã đặt</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
          <thead style="text-align: left; color: #777;">
            <tr>
              <th style="padding: 12px 12px 12px 0;">Sản phẩm</th>
              <th style="padding: 12px; text-align: center;">Số lượng</th>
              <th style="padding: 12px 0 12px 12px; text-align: right;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; text-align: right; line-height: 1.8;">
          <tbody>
            <tr>
              <td style="padding: 4px;">Tạm tính:</td>
              <td style="padding: 4px; width: 30%; font-weight: 500;">${formatCurrency(
                order.subtotal
              )}</td>
            </tr>
            <tr>
              <td style="padding: 4px;">Phí vận chuyển:</td>
              <td style="padding: 4px; font-weight: 500;">${formatCurrency(
                order.shippingFee
              )}</td>
            </tr>
            ${
              order.discount > 0
                ? `
            <tr>
              <td style="padding: 4px;">Giảm giá (${order.coupon}):</td>
              <td style="padding: 4px; color: #28a745; font-weight: 500;">- ${formatCurrency(
                order.discount
              )}</td>
            </tr>`
                : ""
            }
            <tr style="font-weight: bold; font-size: 1.2em; border-top: 2px solid #ddd; margin-top: 5px;">
              <td style="padding: 12px 4px 4px;">Tổng cộng:</td>
              <td style="padding: 12px 4px 4px; color: #d9534f;">${formatCurrency(
                order.total
              )}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 24px; text-align: center; color: #777; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} KaynStyle. Đã đăng ký Bản quyền.</p>
      </div>
    </div>
  `;
};

const placeOrder = async () => {
  if (
    !userInfo.value.fullname ||
    !userInfo.value.address ||
    !userInfo.value.phone
  ) {
    Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin giao hàng.", "error");
    return;
  }

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  
  const customerEmail = loggedInUser?.email;

  if (!customerEmail) {
    console.warn(
      "Không tìm thấy email người dùng. Sẽ không gửi mail cho khách hàng."
    );
  }

  const orderDetails = {
    userId: loggedInUser?.id || null,
    customerInfo: {
      ...userInfo.value,
      email: customerEmail || null,
    },
    products: cart.value,
    subtotal: subtotal.value,
    shippingFee: shippingFee.value,
    discount: discount.value,
    note: userInfo.value.note,
    total: total.value,
    paymentMethod: paymentMethod.value,
    coupon: appliedCoupon.value?.code || null,
    status: "Chờ xử lý",
    orderDate: new Date().toISOString(),
  };

  try {
    const orderResponse = await axios.post(
      `${API_URL}/orders`,
      orderDetails,
      ngrokHeaderConfig
    );
    
    const newOrder = orderResponse.data;

    for (const item of cart.value) {
      try {
        const response = await axios.get(
          `${API_URL}/products/${item.productId}`,
          ngrokHeaderConfig
        );
        const product = response.data;
        const newQuantity = product.quantity - item.quantity;

        await axios.patch(
          `${API_URL}/products/${item.productId}`,
          {
            quantity: newQuantity,
          },
          ngrokHeaderConfig
        );
      } catch (error) {
        console.error(
          `Lỗi khi cập nhật số lượng cho sản phẩm ${item.productId}:`,
          error
        );
      }
    }


    const emailHtml = formatOrderToHTML(newOrder);

    if (customerEmail) {
      sendEmail({
        to: customerEmail,
        subject: `[KaynStyle] Xác nhận đơn hàng #${newOrder.id}`,
        html: emailHtml,
      });
    }

    const adminHtml = `
      <h2 style="color: #d9534f; font-family: Arial, sans-serif;">Có đơn hàng mới!</h2>
      <p style="font-family: Arial, sans-serif;">Một đơn hàng mới vừa được đặt trên website KaynStyle.</p>
      <hr>
      ${emailHtml}
    `;
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `[ĐƠN HÀNG MỚI] Khách ${newOrder.customerInfo.fullname} vừa đặt hàng #${newOrder.id}`,
      html: adminHtml,
    });

    await store.dispatch("cart/deleteAllCart");

    Swal.fire({
      icon: "success",
      title: "Đặt hàng thành công!",
      text: "Cảm ơn bạn đã mua hàng tại KaynStyle 🎧",
      confirmButtonText: "Xem đơn hàng",
    }).then(() => {
      router.push("/ordersHistory");
    });
  } catch (err) {
    console.error("Lỗi khi đặt hàng:", err);
    Swal.fire("Lỗi", "Đã có lỗi xảy ra, vui lòng thử lại.", "error");
  }
};
</script>

<template>
  <div class="container my-5">
    <h2 class="fw-bold mb-4 text-center">Thanh Toán</h2>

    <div v-if="cart.length === 0" class="text-center">
      <p>
        🛒 Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm để thanh toán.
      </p>
    </div>

    <div v-else class="row g-5">
      <div class="col-md-7">
        <h4 class="mb-3 fw-semibold">Thông tin giao hàng 🧾</h4>
        <div class="card p-4 shadow-sm border-0">
          <div class="mb-3">
            <label class="form-label">Họ và tên</label>
            <input
              type="text"
              v-model="userInfo.fullname"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Địa chỉ</label>
            <input
              type="text"
              v-model="userInfo.address"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Số điện thoại</label>
            <input type="tel" v-model="userInfo.phone" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Ghi chú <em>(tùy chọn)</em></label>
            <textarea
              v-model="userInfo.note"
              class="form-control"
              rows="3"
            ></textarea>
          </div>
        </div>

        <h4 class="mt-4 mb-3 fw-semibold">Phương thức thanh toán 💳</h4>
        <div class="card p-4 shadow-sm border-0">
          <div class="form-check d-flex align-items-center gap-2 mb-2">
            <input
              class="form-check-input mt-0"
              type="radio"
              v-model="paymentMethod"
              value="cod"
              id="cod"
            />
            <label
              class="form-check-label d-flex align-items-center gap-2 fw-medium"
              for="cod"
            >
              <i class="fa-solid fa-hand-holding-dollar text-success fs-5"></i>
              <span>Thanh toán khi nhận hàng (COD)</span>
            </label>
          </div>

          <div class="form-check d-flex align-items-center gap-2 mb-2">
            <input
              class="form-check-input mt-0"
              type="radio"
              v-model="paymentMethod"
              value="momo"
              id="momo"
            />
            <label
              class="form-check-label d-flex align-items-center gap-2 fw-medium"
              for="momo"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                alt="MoMo"
                width="22"
                height="22"
                style="border-radius: 4px"
              />
              <span>Thanh toán qua MoMo</span>
            </label>
          </div>

          <div class="form-check d-flex align-items-center gap-2">
            <input
              class="form-check-input mt-0"
              type="radio"
              v-model="paymentMethod"
              value="vnpay"
              id="vnpay"
              disabled
            />
            <label
              class="form-check-label d-flex align-items-center gap-2 text-muted"
              for="vnpay"
            >
              <i class="fa-solid fa-credit-card text-primary fs-5"></i>
              <span>VNPAY (Đang phát triển)</span>
            </label>
          </div>
        </div>
      </div>

      <div class="col-md-5">
        <h4 class="mb-3 fw-semibold">Tóm tắt đơn hàng</h4>
        <div class="card p-4 shadow-sm border-0">
          <div
            v-for="item in cart"
            :key="item.id"
            class="cart-item d-flex align-items-center justify-content-between mb-3"
          >
            <div class="d-flex align-items-center gap-3">
              <img
                :src="item.image[0]"
                alt="Ảnh sản phẩm"
                class="product-thumb"
              />
              <div>
                <p class="mb-1 fw-medium">{{ item.name }}</p>
                <small class="text-muted">Số lượng: {{ item.quantity }}</small>
              </div>
            </div>
            <div class="text-end">
              <span class="fw-semibold">
                {{
                  (
                    (item.discount || item.price) * item.quantity
                  ).toLocaleString("vi-VN")
                }}
                ₫
              </span>
            </div>
          </div>

          <hr />
          <div class="d-flex justify-content-between mb-2">
            <strong>Tạm tính</strong>
            <strong>{{ subtotal.toLocaleString("vi-VN") }} ₫</strong>
          </div>

          <div class="d-flex justify-content-between mb-2">
            <strong>Phí vận chuyển</strong>
            <strong>
              <span v-if="shippingFee === 0" class="text-success"
                >Miễn phí</span
              >
              <span v-else>{{ shippingFee.toLocaleString("vi-VN") }} ₫</span>
            </strong>
          </div>

          <div
            v-if="discount > 0"
            class="d-flex justify-content-between text-success mb-2"
          >
            <strong>Giảm giá ({{ appliedCoupon?.code }})</strong>
            <strong>- {{ discount.toLocaleString("vi-VN") }} ₫</strong>
          </div>

          <hr />
          <div class="d-flex justify-content-between fw-bold fs-5">
            <span>Tổng cộng</span>
            <span class="text-danger"
              >{{ total.toLocaleString("vi-VN") }} ₫</span
            >
          </div>

          <div class="input-group mt-4">
            <input
              type="text"
              v-model="couponCode"
              class="form-control"
              placeholder="Nhập mã giảm giá"
            />
            <button @click="applyCoupon" class="btn btn-dark">Áp dụng</button>
          </div>

          <button
            @click="placeOrder"
            class="btn btn-success w-100 mt-3 fw-bold py-2"
          >
            ĐẶT HÀNG NGAY
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  color: #222;
}

.card {
  border-radius: 12px;
}

.btn {
  border-radius: 8px;
}

.text-danger {
  font-weight: bold;
}

.cart-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.product-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>