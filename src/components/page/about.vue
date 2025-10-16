<template>
  <div class="container my-5">
    <!-- Giới thiệu thương hiệu -->
    <div class="text-center mb-5">
      <h2 class="fw-bold text-uppercase">Về KaynStyle</h2>
      <p class="text-muted mx-auto" style="max-width: 600px;">
        KaynStyle mang đến cho bạn những mẫu tai nghe hiện đại, thiết kế tinh tế và chất âm vượt trội —
        nơi phong cách gặp gỡ công nghệ để tạo nên trải nghiệm âm thanh hoàn hảo nhất.
      </p>
    </div>

    <!-- Ảnh + mô tả -->
    <div class="row align-items-center mb-5">
      <div class="col-md-6 mb-4 mb-md-0">
        <img
          src="https://kaynstyle.io.vn/wp-content/uploads/2025/09/img-uu-diem-tai-nghe-ne-1200x800.jpg"
          class="img-fluid rounded shadow-sm"
          alt="tai nghe kaynstyle"
        />
      </div>
      <div class="col-md-6">
        <h4 class="fw-bold mb-3">Sứ mệnh & Tầm nhìn</h4>
        <p class="text-muted">
          Chúng tôi không chỉ bán tai nghe — chúng tôi mang đến cảm xúc.  
          Mỗi sản phẩm của <strong>KaynStyle</strong> đều được chọn lọc kỹ lưỡng, đảm bảo chất lượng âm thanh,
          thiết kế thời thượng và trải nghiệm người dùng tối ưu.
        </p>
        <ul class="list-unstyled mt-3">
          <li><i class="fa fa-check text-primary me-2"></i>Âm thanh chân thực, sống động</li>
          <li><i class="fa fa-check text-primary me-2"></i>Thiết kế thời trang, năng động</li>
          <li><i class="fa fa-check text-primary me-2"></i>Kết nối ổn định, pin bền bỉ</li>
          <li><i class="fa fa-check text-primary me-2"></i>Hỗ trợ khách hàng tận tâm 24/7</li>
        </ul>
      </div>
    </div>

    <!-- Đội ngũ -->
    <div class="text-center mb-4">
      <h4 class="fw-bold mb-3 text-uppercase">Đội Ngũ KaynStyle</h4>
      <p class="text-muted">Những người tạo nên âm thanh và phong cách của bạn 🎧</p>
    </div>

    <div class="row g-4 justify-content-center">
      <div
        class="col-6 col-md-4 col-lg-3"
        v-for="(member, index) in team"
        :key="index"
      >
        <div class="card border-0 shadow-sm text-center rounded-4 p-3 h-100">
          <img
            :src="member.img"
            class="rounded-circle mx-auto mb-3"
            width="100"
            height="100"
          />
          <h6 class="fw-bold">{{ member.name }}</h6>
          <p class="text-muted small mb-1">{{ member.role }}</p>
          <div class="social-links">
            <a href="#" class="text-dark me-2"><i class="fab fa-facebook"></i></a>
            <a href="#" class="text-dark me-2"><i class="fab fa-instagram"></i></a>
            <a href="#" class="text-dark"><i class="fab fa-github"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const team = ref([
  {
    name: "Trịnh Trần Phương Tuấn",
    role: "NSX",
    img: "https://cdn.tienphong.vn/images/a6bf4f60924201126af6849ca45a3980160ab902659ea023e1cf1d03333790ffdb080200191e7bf18a3a0dfbb09d41cfd71ff3ae94a9588aa0e876f98043e216c4c98c51719e87af39ecc66ae14c30c77c03e52d3e116e53f0c4cde4b9e024fd/324182916-1202101170734842-1634750518466414935-n-952.jpg",
  },
  {
    name: "Trần Hà Linh",
    role: "UI/UX Designer",
    img: "https://khoinghiep.net.vn/uploads/images/2024/11/20/z6051206671978-dd777030b9429c011475c64d9c929a1d-1732081786.jpg",
  },
  {
    name: "Bún Bò Huế",
    role: "Marketing",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDQ2OYisaJDpzUDjwDb-Q_ugpP_vVZlskF52sTHR5TOr4k3ajpJKb2MXI1oECkH4SDME&usqp=CAU",
  },
  {
    name: "Bình An",
    role: "Dev",
    img: "https://35express.org/wp-content/uploads/2024/09/binh-an-1.jpg.webp",
  },
]);
</script>

<style scoped>
.text-center.mb-5{
  margin-top: 120px;
}
img {
  object-fit: cover;
}

.card img {
  transition: 0.3s ease;
}

.card:hover img {
  transform: scale(1.05);
}

.card:hover {
  transform: translateY(-4px);
  transition: 0.3s;
}

.fa-check {
  font-size: 0.95rem;
}

h2,
h4 {
  color: #111;
}

.text-primary {
  color: #007bff !important;
}
</style>

