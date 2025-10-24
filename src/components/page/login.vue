<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const router = useRouter();

const email = ref("");
const password = ref("");
const form = ref([]);
const message = ref("");
const isSuccess = ref(false);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const readadmin = async () => {
    try {
        const res = await axios.get(`${API_URL}/user`, ngrokHeaderConfig);
        form.value = res.data;
    } catch (err) {
        console.log("Fetch posts error:", err);
    }
};

const handleLogin = () => {
    if (email.value === "") {
        message.value = "Email cannot be blank";
        isSuccess.value = false;
        return;
    }
    if (password.value === "") {
        message.value = "Password cannot be blank";
        isSuccess.value = false;
        return;
    }

    const user = form.value.find(u => u.email === email.value && u.password === password.value);

    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Đăng Nhập Thất Bại',
            text: 'Email hoặc mật khẩu không đúng!',
            confirmButtonColor: '#000'
        })
    } else {
        Swal.fire({
            icon: 'success',
            title: 'Đăng Nhập Thành Công',
            text: 'Bạn đã đăng nhập thành công!',
            showConfirmButton: true,
            confirmButtonText: 'Đến Trang Chủ',
            confirmButtonColor: '#000'
        }).then(() => {
            window.location.href = '/'
        })

        localStorage.setItem('loggedInUser', JSON.stringify(user));
    }
};

onMounted(readadmin);
</script>

<template>
    <div class="container d-flex justify-content-center align-items-center vh-100">
        <div class="card shadow-lg p-4 rounded-4" style="max-width: 400px; width: 100%;">
            <h3 class="text-center mb-4">Đăng Nhập</h3>
            <form @submit.prevent="handleLogin">
                <!-- Email -->
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" v-model="email" placeholder="abc@gmail.com"
                        required />
                </div>

                <!-- Password -->
                <div class="mb-3">
                    <label for="password" class="form-label">Mật Khẩu</label>
                    <input type="password" class="form-control" id="password" v-model="password"
                        placeholder="******" required />
                </div>

                <div class="d-grid">
                    <button type="submit" class="btn btn-info">Đăng nhập</button>
                </div>
            </form>

            <p class="text-center mt-3 mb-0" :class="isSuccess ? 'text-success' : 'text-danger'">
                {{ message }}
            </p>

            <p class="text-center mt-3 mb-0">
                Bạn chưa có tài khoản?
                <router-link to="/register" class="text-decoration-none fw-semibold text-dark">Đăng ký ngay</router-link>
            </p>
        </div>
    </div>
</template>
