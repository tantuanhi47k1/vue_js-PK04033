<template>
  <div class="container" style="margin-top: 150px;">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4 shadow-sm border-0">
          <h2 class="text-center mb-4 fw-bold text-success">Liên hệ với chúng tôi</h2>

          <form @submit.prevent="sendMail">
            <div class="mb-3">
              <label class="form-label">Email của bạn:</label>
              <input
                v-model="email"
                type="email"
                class="form-control"
                placeholder="Nhập email"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Tiêu đề:</label>
              <input
                v-model="subject"
                type="text"
                class="form-control"
                placeholder="Nhập tiêu đề"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Nội dung:</label>
              <textarea
                v-model="message"
                class="form-control"
                placeholder="Nhập nội dung"
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-success w-100 fw-bold">
              Gửi Mail ✉️
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const email = ref('');
const subject = ref('');
const message = ref('');

const sendMail = async () => {
  if (!email.value || !subject.value || !message.value) {
    Swal.fire('Thiếu thông tin', 'Vui lòng điền đầy đủ các trường!', 'warning');
    return;
  }

  try {
    const res = await axios.post('http://localhost:3001/send-mail', {
      to: email.value,
      subject: subject.value,
      text: message.value,
    });

    Swal.fire('Thành công!', res.data.message || 'Mail đã được gửi!', 'success');

    email.value = '';
    subject.value = '';
    message.value = '';
  } catch (err) {
    console.error('Lỗi gửi mail:', err.response?.data || err.message);
    Swal.fire('Thất bại', 'Gửi mail thất bại, vui lòng thử lại!', 'error');
  }
};
</script>
