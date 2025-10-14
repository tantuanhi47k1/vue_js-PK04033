<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const user = ref({
  id: null,
  fullname: "",
  email: "",
  phone: "",
  address: "",
  role: "",
  password: "",
  image: "",
  day_of_birth: "",
  sex: "",
});

onMounted(() => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser) {
    user.value = { ...loggedInUser };
  } else {
    Swal.fire({
      icon: "error",
      title: "Bạn chưa đăng nhập!",
      text: "Vui lòng đăng nhập để xem trang cá nhân.",
      confirmButtonColor: "#000",
    }).then(() => {
      window.location.href = "/login";
    });
  }
});

const saveChanges = async () => {
  try {
    await axios.put(`http://localhost:3000/user/${user.value.id}`, user.value);
    localStorage.setItem("loggedInUser", JSON.stringify(user.value));

    Swal.fire({
      icon: "success",
      title: "Cập nhật thành công!",
      text: "Thông tin của bạn đã được cập nhật.",
      confirmButtonColor: "#000",
    });
  } catch (err) {
    console.error("Update error:", err);
    Swal.fire({
      icon: "error",
      title: "Cập nhật thất bại!",
      text: "Đã có lỗi xảy ra khi cập nhật thông tin.",
      confirmButtonColor: "#000",
    });
  }
};
</script>

<template>
  <div class="container py-5">
    <div
      class="card shadow-lg border-0 rounded-4 p-4 profile-card mx-auto"
      style="max-width: 800px"
    >
      <div class="d-flex align-items-center gap-4 flex-wrap">
        <div class="text-center flex-shrink-0">
          <img
            :src="
              user.image ||
              'https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/509356676_2174215323040917_4670940307410756592_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=ELdGa6SjYUwQ7kNvwFxhi4s&_nc_oc=AdmVLX7FI6sSwx0MU5AgO770JlRbJrg_qV28KoyP-hpwFw61iuQM3xU6GA9Ll1duO4k&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=lpkRY_3I7Zq1g728abNm1w&oh=00_AffVpOtMbMq-GKa5zEoHIhGw-071xf-nACy7YIKSdTMwjw&oe=68F293FE'
            "
            alt="avatar"
            class="rounded-circle border shadow-sm"
            width="140"
            height="140"
          />
          <div class="mt-3 d-flex flex-column gap-2 align-items-center">
            <button class="btn btn-outline-dark btn-sm px-3">
              <i class="fa fa-camera me-2"></i>Thay đổi avt
            </button>
            <router-link to="/ordersHistory" class="btn btn-outline-success btn-sm px-3">
              <i class="fa fa-clock me-2"></i>Lịch Sử Mua Hàng
            </router-link>
          </div>
        </div>

        <!-- Thông tin -->
        <div class="flex-grow-1">
          <h3 class="fw-bold mb-2">{{ user.fullname }}</h3>
          <p class="text-muted mb-1">
            <i class="fa fa-envelope me-2" style="color: greenyellow"></i
            >{{ user.email }}
          </p>
          <p class="text-muted mb-1">
            <i class="fa fa-phone me-2" style="color: aquamarine"></i
            >{{ user.phone }}
          </p>
          <p class="text-muted mb-1">
            <i class="fa fa-map-marker me-2" style="color: brown"></i
            >{{ user.address }}
          </p>
          <p class="text-muted mb-1">
            <i class="fa-solid fa-person" style="color: pink"></i
            >{{
              user.day_of_birth
                ? new Date().getFullYear() -
                  new Date(user.day_of_birth).getFullYear() +
                  " Tuổi"
                : ""
            }}
          </p>
          <span class="badge bg-success mt-2 text-uppercase">{{
            user.role
          }}</span>
        </div>
      </div>

      <hr class="my-4" />

      <!-- Form chỉnh sửa -->
      <div>
        <h5 class="fw-bold mb-3">Sửa Thông Tin</h5>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Họ Và Tên</label>
            <input
              v-model="user.fullname"
              type="text"
              class="form-control"
              placeholder="Nhập họ tên"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input
              v-model="user.email"
              type="email"
              class="form-control"
              placeholder="Nhập email"
              disabled
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Số Điện Thoại</label>
            <input
              v-model="user.phone"
              type="text"
              class="form-control"
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Địa Chỉ</label>
            <input
              v-model="user.address"
              type="text"
              class="form-control"
              placeholder="Nhập địa chỉ"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Năm Sinh</label>
            <input
              v-model="user.day_of_birth"
              type="date"
              class="form-control"
              placeholder="Nhập tuổi"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Giới Tính</label>
            <select v-model="user.sex" class="form-control">
              <option value="Nam">Nam</option>
              <option value="Nu">Nữ</option>
              <option value="BeDe">Bê Đê</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Mật Khẩu Mới</label>
            <input
              v-model="user.password"
              type="password"
              class="form-control"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
        </div>

        <div class="mt-4 d-flex gap-3">
          <button class="btn btn-success px-4 py-2" @click="saveChanges">
            <i class="fa fa-save me-2"></i>Lưu
          </button>
          <button class="btn btn-outline-danger px-4 py-2">
            <i class="fa fa-times me-2"></i>Thoát
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  background: #fff;
}

img {
  object-fit: cover;
  transition: 0.3s ease;
}

img:hover {
  transform: scale(1.03);
}

input:focus {
  border-color: #000 !important;
  box-shadow: none;
}

.btn-dark:hover {
  background-color: #222 !important;
}
</style>
