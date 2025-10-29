<script setup>
import { ref } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const form = ref({
  fullname: "",
  email: "",
  password: "",
  repassword: "",
  phone: "",
  address: "",
  role: "user",
});

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
  headers: { "ngrok-skip-browser-warning": "true" },
};

const handleSubmit = async () => {
  if (form.value.password !== form.value.repassword) {
    Swal.fire({
      icon: "error",
      title: "Mật khẩu không khớp!",
      text: "Vui lòng nhập lại mật khẩu giống nhau!",
      confirmButtonColor: "#000",
    });
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some((u) => u.email === form.value.email)) {
    Swal.fire({
      icon: "error",
      title: "Email đã tồn tại!",
      text: "Vui lòng sử dụng email khác!",
      confirmButtonColor: "#000",
    });
    return;
  }

  try {
    const res = await axios.post(`${API_URL}/user`, form.value, ngrokHeaderConfig);

    if (res.status === 201 || res.status === 200) {
      users.push(form.value);
      localStorage.setItem("users", JSON.stringify(users));

      Swal.fire({
        icon: "success",
        title: "Tạo Tài Khoản Thành Công!",
        text: "Bạn đã đăng ký thành công!",
        showConfirmButton: true,
        confirmButtonText: "Đến Đăng Nhập",
        confirmButtonColor: "#000",
      }).then(() => {
        window.location.href = "/login";
      });

      form.value = {
        fullname: "",
        email: "",
        password: "",
        repassword: "",
        phone: "",
        address: "",
        role: "user",
      };
    }
  } catch (err) {
    console.error("Err:", err);
    Swal.fire({
      icon: "error",
      title: "Đăng ký thất bại!",
      text: "Vui lòng thử lại sau!",
      confirmButtonColor: "#000",
    });
  }
};
</script>

<template>
  <div
    class="register-wrapper d-flex justify-content-center align-items-center vh-100"
  >
    <div
      class="card shadow-lg border-0 rounded-4 p-4"
      style="max-width: 450px; width: 100%; background-color: #fff"
    >
      <h3 class="text-center fw-bold mb-4 text-dark">Đăng Ký</h3>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="fullname" class="form-label fw-semibold text-dark"
            >Họ Và Tên</label
          >
          <input
            v-model="form.fullname"
            type="text"
            id="fullname"
            class="form-control border-dark-subtle"
            placeholder="Nguyễn Văn A"
            required
          />
        </div>

        <div class="mb-3">
          <label for="email" class="form-label fw-semibold text-dark"
            >Email</label
          >
          <input
            v-model="form.email"
            type="email"
            id="email"
            class="form-control border-dark-subtle"
            placeholder="@gmail.com"
            required
          />
        </div>

        <div class="mb-3">
          <label for="phone" class="form-label fw-semibold text-dark"
            >Điện Thoại</label
          >
          <input
            v-model="form.phone"
            type="text"
            id="phone"
            class="form-control border-dark-subtle"
            placeholder="0987 654 321"
          />
        </div>

        <div class="mb-3">
          <label for="address" class="form-label fw-semibold text-dark"
            >Địa Chỉ</label
          >
          <input
            v-model="form.address"
            type="text"
            id="address"
            class="form-control border-dark-subtle"
            placeholder="Địa chỉ của bạn"
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label fw-semibold text-dark"
            >Mật Khẩu</label
          >
          <input
            v-model="form.password"
            type="password"
            id="password"
            class="form-control border-dark-subtle"
            placeholder="******"
            required
          />
        </div>

        <div class="mb-3">
          <label for="repassword" class="form-label">Nhập lại mật khẩu</label>
          <input
            v-model="form.repassword"
            type="password"
            id="repassword"
            class="form-control"
            placeholder="******"
            required
          />
        </div>

        <div class="d-grid">
          <button type="submit" class="btn btn-info fw-semibold py-2">
            Đăng Ký
          </button>
        </div>
      </form>

      <p class="text-center mt-3 mb-0 text-dark">
        Tôi đã có tài khoản!
        <router-link
          to="/login"
          class="text-decoration-none fw-semibold text-dark"
          >Đăng Nhập Ngay!</router-link
        >
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-wrapper {
  background-color: #f4f4f4;
}

.card {
  transition: 0.3s;
}

input:focus {
  box-shadow: none;
  border-color: #000 !important;
}
</style>
