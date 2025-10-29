<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const comments = ref([]);
const isLoading = ref(true);
const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
  headers: { 'ngrok-skip-browser-warning': 'true' },
};

// bình luận all
const fetchComments = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(
      `${API_URL}/comments?_sort=createdAt&_order=desc`,
      ngrokHeaderConfig
    );
    comments.value = response.data;
  } catch (error) {
    console.error('Lỗi khi tải bình luận:', error);
  } finally {
    isLoading.value = false;
  }
};

// duyệt bl
const approveComment = async (id) => {
  try {
    await axios.patch(
      `${API_URL}/comments/${id}`,
      { status: 'Đã duyệt' },
      ngrokHeaderConfig
    );
    // update trạng thái trong ds
    const index = comments.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      comments.value[index].status = 'Đã duyệt';
    }
    Swal.fire('Đã duyệt', 'Bình luận đã được hiển thị.', 'success');
  } catch (error) {
    Swal.fire('Lỗi', 'Không thể duyệt bình luận.', 'error');
  }
};

// delete bl
const deleteComment = async (id) => {
  const result = await Swal.fire({
    title: 'Bạn chắc chứ?',
    text: 'Bạn sẽ không thể hoàn tác hành động này!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Vâng, xóa nó!',
    cancelButtonText: 'Hủy',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_URL}/comments/${id}`, ngrokHeaderConfig);
      // delete trong ds
      comments.value = comments.value.filter((c) => c.id !== id);
      Swal.fire('Đã xóa', 'Bình luận đã được xóa.', 'success');
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể xóa bình luận.', 'error');
    }
  }
};

// màu of trạng thái
const getStatusClass = (status) => {
  if (status === 'Đã duyệt') return 'bg-success';
  if (status === 'Chờ xử lý') return 'bg-warning text-dark';
  return 'bg-secondary';
};

onMounted(fetchComments);
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-4">Quản lý Bình luận</h2>

    <div v-if="isLoading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="comments.length === 0">
      <p>Không có bình luận nào.</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th scope="col">Người dùng</th>
            <th scope="col">Bình luận</th>
            <th scope="col">Sản phẩm (ID)</th>
            <th scope="col">Ngày gửi</th>
            <th scope="col">Trạng thái</th>
            <th scope="col" class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in comments" :key="comment.id">
            <td>{{ comment.userName }}</td>
            <td style="max-width: 300px">{{ comment.content }}</td>
            <td>{{ comment.productId }}</td>
            <td>{{ new Date(comment.createdAt).toLocaleString('vi-VN') }}</td>
            <td>
              <span
                :class="getStatusClass(comment.status)"
                class="badge"
              >
                {{ comment.status }}
              </span>
            </td>
            <td class="text-end">
              <button
                v-if="comment.status === 'Chờ xử lý'"
                @click="approveComment(comment.id)"
                class="btn btn-success btn-sm me-2"
              >
                Duyệt
              </button>
              <button
                @click="deleteComment(comment.id)"
                class="btn btn-danger btn-sm"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
</style>