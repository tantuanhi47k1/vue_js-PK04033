<template>
  <div class="container" style="margin-top: 150px;">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card p-4 shadow-sm">
          <h2 class="text-center mb-4">Liên hệ với chúng tôi</h2>
          <form @submit.prevent="sendMail">
            <div class="mb-3">
              <label class="form-label">Email của bạn:</label>
              <input v-model="email" type="email" class="form-control" placeholder="Email" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Tiêu đề:</label>
              <input v-model="subject" type="text" class="form-control" placeholder="Tiêu đề" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Nội dung:</label>
              <textarea v-model="message" class="form-control" placeholder="Nội dung" rows="5" required></textarea>
            </div>

            <button type="submit" class="btn btn-success w-100">Gửi Mail</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const subject = ref('');
const message = ref('');

const sendMail = async () => {
  if (!email.value || !subject.value || !message.value) {
    alert('Vui lòng điền đầy đủ thông tin!');
    return;
  }

  try {
    const res = await axios.post('http://localhost:3001/send-mail', {
      to: email.value,
      subject: subject.value,
      text: message.value,
    });
    alert(res.data.message);

    email.value = '';
    subject.value = '';
    message.value = '';
  } catch (err) {
    console.error('Lỗi gửi mail:', err.response?.data || err.message);
    alert('Gửi mail thất bại, vui lòng thử lại!');
  }
};
</script>

<style scoped>
</style>
