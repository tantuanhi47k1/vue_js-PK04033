<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const coupon = ref([]);

const readCoupon = async() => {
    try{
        const res = await axios.get(`http://localhost:3000/coupons`)
        coupon.value = res.data
    } catch (err){
        console.error('Lỗi mã giảm giá!', err)
    }
}

const deleteCoupon = async() => {
    const isConfirm = confirm('Bạn chắc chắn muốn xóa mã giảm giá không?')
    if(isConfirm){
        try{
            const 
        }
    }
}

onMounted(readCoupon)
</script>

<template>
  <div class="container mt-5">
    <h2 class="text-center fw-bold mb-4">Quản Lý Mã Giảm Giá 🎫</h2>

    <!-- Nút thêm sản phẩm -->
    <div class="text-end mb-3">
      <button
        class="btn btn-dark px-3"
        data-bs-toggle="modal"
        data-bs-target="#addProductModal"
      >
        <i class="fa fa-plus me-1"></i> Thêm mã giảm giá
      </button>
    </div>

    <!-- Bảng sản phẩm -->
    <div class="table-responsive shadow-sm rounded-3">
      <table class="table table-bordered table-hover align-middle mb-0">
        <thead class="table-dark text-center">
          <tr>
            <th style="width: 5%">#</th>
            <th>Tiêu đề</th>
            <th>Mã giảm giá</th>
            <th>Giảm giá</th>
            <th>Đơn tối thiểu</th>
            <th>Ngày hết hạn</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody class="text-center">
          <tr
            v-if="coupon.length"
            v-for="(items, index) in coupon"
            :key="items.id"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ items.title }}</td>
            <td>{{ items.code }}</td>
            <td>{{ items.discount }}%</td>
            <td>{{ Number(items.conditions).toLocaleString("vi-VN") }} ₫</td>
            <td>{{ items.expiry }}</td>
            <td>
              <button
                class="btn btn-outline-warning btn-sm me-2"
                data-bs-toggle="modal"
                data-bs-target="#editModal"
              >
                <i class="fa fa-edit"></i>
              </button>
              <button
                class="btn btn-outline-danger btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#deleteModal"
              >
                <i class="fa fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-else>
            <td colspan="8" class="text-center text-muted py-3">
              Chưa có mã giảm giá nào
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm sản phẩm -->
    <div
      class="modal fade"
      id="addProductModal"
      tabindex="-1"
      aria-labelledby="addProductModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Thêm mã giảm giá mới</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Mã giảm giá</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Nhập mã giảm giá (VD: TECH12K)"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tiêu đề</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Nhập tiêu đề"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Giảm giá</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Nhập giá bạn muốn giảm (VD: 100K hoặc 10%)"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Đơn tối thiểu</label>
                  <input
                    type="number"
                    class="form-control"
                    placeholder="Nhập giá đơn tối thiểu"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ngày hết hạn</label>
                  <input
                    type="date"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Chọn phương thức giảm giá</label>
                  <select class="form-select">
                    <option disabled value="">
                      -- Chọn phương thức giảm giá --
                    </option>
                    <option value="giam%">Giảm giá theo %</option>
                    <option value="giamthang">Giảm giá thẳng</option>
                    <option value="giamdacbiet">Giảm giá đặc biệt</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Hủy
            </button>
            <button
              data-bs-dismiss="modal"
              type="button"
              class="btn btn-dark"
            >
              Lưu mã giảm giá
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal sửa sản phẩm -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-warning text-white">
            <h5 class="modal-title">Sửa thông tin mã giảm giá</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Mã giảm giá</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Nhập mã giảm giá (VD: TECH12K)"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tiêu đề</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Nhập tiêu đề"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Giảm giá</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Nhập tiêu đề"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Đơn tối thiểu</label>
                  <input
                    type="number"
                    class="form-control"
                    placeholder="Nhập giá đơn tối thiểu"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ngày hết hạn</label>
                  <input
                    type="date"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Phương thức giảm giá</label>
                  <select class="form-select">
                    <option disabled value="">
                      -- Chọn phương thức giảm giá --
                    </option>
                    <option value="giam%">Giảm giá theo %</option>
                    <option value="giamthang">Giảm giá thẳng</option>
                    <option value="giamdacbiet">Giảm giá đặc biệt</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Hủy
            </button>
            <button
              class="btn btn-warning text-white"
              data-bs-dismiss="modal"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận xoá -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Xác nhận xoá</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body text-center py-4">
            <i class="fa fa-exclamation-triangle fa-2x text-danger mb-3"></i>
            <p>
              Bạn có chắc muốn xoá mã giảm giá
              <strong></strong> không?
            </p>
          </div>
          <div class="modal-footer border-0 justify-content-center">
            <button class="btn btn-secondary" data-bs-dismiss="modal">
              Huỷ
            </button>
            <button
              data-bs-dismiss="modal"
              class="btn btn-danger"
            >
              Xoá
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
