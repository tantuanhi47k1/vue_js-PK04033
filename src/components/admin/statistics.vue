<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import axios from "axios";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const orders = ref([]);
const chartData = ref(null);

const totalOrders = computed(() => orders.value.length);
const totalRevenue = computed(() =>
  orders.value.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ngrokHeaderConfig = {
    headers: { 'ngrok-skip-browser-warning': 'true' },
};

// cấu hình biểu đồ
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Thống kê doanh thu theo ngày" },
  },
  layout: {
    padding: { left: 0, right: 0, top: 10, bottom: 0 },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { font: { size: 12 } },
      grid: { drawBorder: false },
    },
    x: {
      ticks: { font: { size: 12 } },
      grid: { drawBorder: false },
      offset: false,
    },
  },
});

onMounted(async () => {
  try {
    const response = await axios.get(`${API_URL}/orders`, ngrokHeaderConfig);
    orders.value = response.data || [];

    // lấy toàn bộ dthu theo ngày
    const revenueByDate = {};
    orders.value.forEach((order) => {
      const date = new Date(order.orderDate).toLocaleDateString("vi-VN");
      revenueByDate[date] =
        (revenueByDate[date] || 0) + parseFloat(order.total || 0);
    });

    // gán dliệu cho biểu đồ
    chartData.value = {
      labels: Object.keys(revenueByDate),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: Object.values(revenueByDate),
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderRadius: 6,
          barThickness: 15,
          maxBarThickness: 20,
          categoryPercentage: 0.6,
          barPercentage: 0.6,
        },
      ],
    };

    await nextTick();
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
});
</script>

<template>
  <div class="dashboard-container">
    <h2 class="dashboard-title">📊 Thống kê doanh thu</h2>

    <div class="summary-cards">
      <div class="card">
        <h3>Tổng đơn hàng</h3>
        <p>{{ totalOrders }}</p>
      </div>
      <div class="card">
        <h3>Tổng doanh thu</h3>
        <p>{{ totalRevenue.toLocaleString() }} VNĐ</p>
      </div>
    </div>

    <div class="chart-wrapper" v-if="chartData">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="text-muted">⏳ Đang tải biểu đồ...</p>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 40px auto;
  text-align: center;
  font-family: "Poppins", sans-serif;
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 25px;
}

.summary-cards {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.card h3 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 8px;
}

.card p {
  font-size: 1.4rem;
  font-weight: bold;
  color: #007bff;
}

.chart-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: 400px;
  width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
