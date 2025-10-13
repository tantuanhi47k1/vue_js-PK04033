<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'; // 1. Import useStore
import axios from 'axios';

const product = ref(null)
const route = useRoute()
const store = useStore(); // 2. Khởi tạo store
const categories = ref([])

const readProductDetail = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/products/${route.params.id}`)
        product.value = res.data
    } catch (err) {
        console.error('Err: ', err)
    }
}

const readCategories = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/categories`)
        categories.value = res.data
    } catch (err) {
        console.error('Err: ', err)
    }
}

// 3. Sửa lại hàm addToCart để dispatch action của Vuex
const addToCart = () => {
    if (product.value) {
        store.dispatch('cart/addProductToCart', product.value);
        alert('Đã thêm sản phẩm vào giỏ hàng!');
    }
}

onMounted(() => {
    readProductDetail()
    readCategories()
})
</script>

<template>
    <div v-if="product" class="container my-5">
        <div class="row g-4">
            <div class="col-md-6">
                <div class="border rounded p-3 bg-white shadow-sm">
                    <img :src="product.image[0]" class="img-fluid w-100 rounded mb-3 main-img" alt="product" />
                    <div class="d-flex gap-2">
                        <img v-for="(img, idx) in product.image" :key="idx" :src="img" class="img-thumbnail small-img"
                            alt="gallery" />
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="p-3">
                    <h2 class="fw-bold mb-2">{{ product.name }}</h2>

                    <p class="text-muted mb-1">
                        Danh Mục:
                        {{categories.find(c => c.id === product.categoryId)?.nameCategory || "Không có"}}
                    </p>

                    <div class="mb-3">
                        <span class="text-muted text-decoration-line-through me-2">
                            {{ Number(product.price).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="fw-bold text-danger fs-4">
                            {{ Number(product.discount).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="badge bg-success ms-2">
                            -{{ Math.round(100 - (product.discount / product.price) * 100) }}%
                        </span>
                    </div>

                    <p class="text-secondary">
                        Tai nghe KaynStyle mang đến âm thanh sống động, thiết kế hiện đại, kết nối ổn định và pin bền bỉ
                        — đồng hành cùng bạn trong mọi khoảnh khắc âm nhạc và phong cách.
                    </p>

                    <div class="mt-4 d-flex gap-3">
                        <div @click="addToCart" class="btn btn-warning px-4 py-2">
                            <i class="fa fa-shopping-cart me-2"></i>Thêm vào giỏ hàng
                        </div>
                        <button class="btn btn-outline-danger px-4 py-2">
                            <i class="fa fa-heart me-2" style="color: red;"></i>Yêu Thích
                        </button>
                    </div>

                    <hr class="my-4" />

                    <div>
                        <h5 class="fw-bold mb-2">Mô tả sản phẩm</h5>
                        <h2 class="fw-bold mt-4 mb-3 text-dark">Tai Nghe Gaming KaynStyle – Sức Mạnh Âm Thanh Dành
                            Cho Game Thủ</h2>

                        <h3 class="fw-semibold text-dark">Âm thanh sống động, chiến đấu chân thực</h3>
                        <p class="text-muted">
                            Tai nghe gaming <strong>KaynStyle</strong> mang đến chất âm vòm 360° mạnh mẽ, tái hiện chân
                            thực từng hiệu ứng trong game –
                            từ tiếng bước chân, tiếng súng cho đến nhạc nền hoành tráng. Với driver công suất lớn, người
                            dùng sẽ cảm nhận được không gian
                            chiến đấu rõ ràng, chân thực và đầy cuốn hút.
                        </p>

                        <h3 class="fw-semibold text-dark">Thiết kế thoải mái, đậm chất game thủ</h3>
                        <p class="text-muted">
                            Sản phẩm được trang bị đệm tai mềm mại, ôm sát tai giúp đeo lâu không bị đau.
                            Đèn LED RGB nổi bật tạo điểm nhấn cá tính, thể hiện phong cách riêng và năng lượng của mỗi
                            game thủ.
                        </p>

                        <h3 class="fw-semibold text-dark">Kết nối linh hoạt, giao tiếp rõ ràng</h3>
                        <p class="text-muted">
                            Tai nghe có micro chống ồn đa hướng, truyền giọng nói rõ ràng và không bị nhiễu.
                            Tương thích đa nền tảng – PC, laptop, điện thoại, máy chơi game – KaynStyle mang đến trải
                            nghiệm mượt mà, ổn định trong mọi trận đấu.
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <h3>Đánh Giá </h3><p>(hiện chưa có đánh giá)</p>
            </div>
        </div>
    </div>

    <p v-else class="text-center text-muted mt-5">Loading Product...</p>

</template>

<style scoped>
.main-img {
    height: 400px;
    object-fit: cover;
}

.small-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    cursor: pointer;
    transition: 0.3s;
}

.small-img:hover {
    transform: scale(1.05);
    border-color: #000;
}

button.btn-outline-dark:hover {
    background-color: #000;
    color: #fff;
    transition: 0.3s;
}

@media (max-width: 768px) {
    .main-img {
        height: 300px;
    }
}
</style>