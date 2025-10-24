<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

const coupons = ref([]);
const newCoupon = ref({
  code: '',
  title: '',
  discount: '',
  conditions: '',
  expiry: '',
  type: 'percent' // chỉ cho phép giảm theo %
});
const editCouponData = ref({});
const deleteId = ref(null);

const readCoupon = async () => {
  try {
    const res = await axios.get(`${API_URL}/coupons`, ngrokHeaderConfig);
    coupons.value = res.data;
  } catch (err) {
    console.error('Lỗi khi tải mã giảm giá:', err);
  }
};

const validateCoupon = (coupon) => {
  if (!coupon.code.trim()) return '⚠️ Mã giảm giá không được để trống';
  if (!coupon.title.trim()) return '⚠️ Tiêu đề không được để trống';
  if (!coupon.discount || coupon.discount <= 0 || coupon.discount > 100)
    return '⚠️ Giảm giá phải nằm trong khoảng 1% - 100%';
  if (!coupon.conditions || coupon.conditions < 10000)
    return '⚠️ Đơn tối thiểu phải ít nhất 10.000₫';
  if (!coupon.expiry) return '⚠️ Vui lòng chọn ngày hết hạn';
  return null;
};

const addCoupon = async () => {
  const error = validateCoupon(newCoupon.value);
  if (error) return alert(error);

  try {
    await axios.post(`${API_URL}/coupons`, newCoupon.value, ngrokHeaderConfig);
    Swal.fire('Thêm mã giảm giá thành công!', '', 'success');
    Object.keys(newCoupon.value).forEach(k => (newCoupon.value[k] = ''));
    newCoupon.value.type = 'percent';
    await readCoupon();
  } catch (err) {
    console.error('Lỗi khi thêm mã giảm giá:', err);
  }
};

const openEditModal = (item) => {
  editCouponData.value = { ...item };
};

const updateCoupon = async () => {
  const error = validateCoupon(editCouponData.value);
  if (error) return alert(error);

  try {
    editCouponData.value.type = 'percent';
    await axios.put(
      `${API_URL}/coupons/${editCouponData.value.id}`, ngrokHeaderConfig,
      editCouponData.value
    );
    Swal.fire('Cập nhật thành công!', '', 'success');
    await readCoupon();
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err);
  }
};

const openDeleteModal = (id) => {
  deleteId.value = id;
};

const deleteCoupon = async () => {
  try {
    await axios.delete(`${API_URL}/coupons/${deleteId.value}`, ngrokHeaderConfig);
    Swal.fire('Xoá mã giảm giá thành công!', '', 'success');
    await readCoupon();
  } catch (err) {
    console.error('Lỗi khi xóa mã giảm giá:', err);
  }
};

onMounted(readCoupon);
</script>

<template>
  <div class="container mt-5">
    <h2 class="text-center fw-bold mb-4">Quản Lý Mã Giảm Giá (%) 🎫</h2>

    <div class="text-end mb-3">
      <button
        class="btn btn-success px-3"
        data-bs-toggle="modal"
        data-bs-target="#addCouponModal"
      >
        <i class="fa fa-plus me-1"></i> Thêm mã giảm giá
      </button>
    </div>

    <div class="table-responsive shadow-sm rounded-3">
      <table class="table table-bordered table-hover align-middle mb-0">
        <thead class="table-danger text-center">
          <tr>
            <th style="width: 5%">#</th>
            <th>Tiêu đề</th>
            <th>Mã giảm giá</th>
            <th>Giảm (%)</th>
            <th>Đơn tối thiểu</th>
            <th>Ngày hết hạn</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody class="text-center">
          <tr v-if="coupons.length" v-for="(item, index) in coupons" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.title }}</td>
            <td><strong>{{ item.code }}</strong></td>
            <td>{{ item.discount }}%</td>
            <td>{{ Number(item.conditions).toLocaleString('vi-VN') }} ₫</td>
            <td>{{ item.expiry }}</td>
            <td>
              <button
                class="btn btn-outline-warning btn-sm me-2"
                data-bs-toggle="modal"
                data-bs-target="#editModal"
                @click="openEditModal(item)"
              >
                <i class="fa fa-edit"></i>
              </button>
              <button
                class="btn btn-outline-danger btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#deleteModal"
                @click="openDeleteModal(item.id)"
              >
                <i class="fa fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-else>
            <td colspan="7" class="text-center text-muted py-3">
              Chưa có mã giảm giá nào
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm -->
    <div class="modal fade" id="addCouponModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Thêm mã giảm giá (%)</h5>
            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Mã giảm giá</label>
                  <input v-model="newCoupon.code" type="text" class="form-control" placeholder="VD: KAYNSTYLE47" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tiêu đề</label>
                  <input v-model="newCoupon.title" type="text" class="form-control" placeholder="Nhập tiêu đề" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Giảm giá (%)</label>
                  <input v-model="newCoupon.discount" type="number" min="1" max="100" class="form-control" placeholder="Từ 1% đến 100%" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Đơn tối thiểu (₫)</label>
                  <input v-model="newCoupon.conditions" type="number" class="form-control" placeholder="VD: 50000" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ngày hết hạn</label>
                  <input v-model="newCoupon.expiry" type="date" class="form-control" />
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button class="btn btn-dark" data-bs-dismiss="modal" @click="addCoupon">
              Lưu mã giảm giá
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal sửa -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-warning text-white">
            <h5 class="modal-title">Sửa mã giảm giá</h5>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Mã giảm giá</label>
                  <input v-model="editCouponData.code" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tiêu đề</label>
                  <input v-model="editCouponData.title" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Giảm giá (%)</label>
                  <input v-model="editCouponData.discount" type="number" min="1" max="100" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Đơn tối thiểu (₫)</label>
                  <input v-model="editCouponData.conditions" type="number" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ngày hết hạn</label>
                  <input v-model="editCouponData.expiry" type="date" class="form-control" />
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button class="btn btn-warning text-white" data-bs-dismiss="modal" @click="updateCoupon">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xoá -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Xác nhận xoá</h5>
            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center py-4">
            <i class="fa fa-exclamation-triangle fa-2x text-danger mb-3"></i>
            <p>Bạn có chắc muốn xoá mã giảm giá này không?</p>
          </div>
          <div class="modal-footer border-0 justify-content-center">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Huỷ</button>
            <button class="btn btn-danger" data-bs-dismiss="modal" @click="deleteCoupon">Xoá</button>
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
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
  transition: 0.3s;
}
.modal-content {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
