<script setup>
import { ref, onMounted, computed } from "vue";
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
const totalOrders = computed(() => orders.value.length);
const totalRevenue = computed(() =>
  orders.value.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0)
);

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "Doanh thu (VNĐ)",
      data: [],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
    },
  ],
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Thống kê doanh thu theo ngày" },
  },
};

onMounted(async () => {
  try {
    const response = await axios.get("http://localhost/api/orders.php");
    orders.value = response.data || [];

    // Gom doanh thu theo ngày
    const revenueByDate = {};
    orders.value.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString("vi-VN");
      revenueByDate[date] =
        (revenueByDate[date] || 0) + parseFloat(order.total_price || 0);
    });

    chartData.value.labels = Object.keys(revenueByDate);
    chartData.value.datasets[0].data = Object.values(revenueByDate);
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

    <div class="chart-wrapper">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 900px;
  margin: 40px auto;
  text-align: center;
  font-family: "Poppins", sans-serif;
}

.dashboard-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 20px;
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
}
</style>
