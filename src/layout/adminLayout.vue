<template>
    <div class="admin-layout d-flex flex-column min-vh-100 bg-light text-dark">
        <div class="d-flex flex-grow-1">
            <aside class="sidebar bg-secondary text-white p-3">
                <router-link class="navbar-brand d-flex align-items-center" to="/">
                    <img src="https://kaynstyle.io.vn/wp-content/uploads/2025/09/logowebsiteKayn-e1758976606143.png"
                        alt="logo" width="180" class="me-2" />
                </router-link>
                <ul class="list-unstyled d-flex flex-column gap-2">
                    <li>
                        <router-link to="/admin/user" class="nav-link" active-class="active-link">
                            👤 Người dùng
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/admin/categories" class="nav-link" active-class="active-link">
                            🧾 Danh Mục
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/admin/product" class="nav-link" active-class="active-link">
                            📦 Sản Phẩm
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/admin/orders" class="nav-link" active-class="active-link">⚙️ QLý Đơn Hàng</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/admin/CRUDcoupons" class="nav-link" active-class="active-link">🎫 Mã Giảm Giá</RouterLink>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/statistics" class="nav-link" active-class="active-link">📊 Thông Kê</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/manageComments" class="nav-link" active-class="active-link">💬 QLý Bình Luận</router-link>
                    </li>
                </ul>   

                <div class="mt-auto text-center pt-4 border-top border-secondary">
                    <router-link to="/" class="btn btn-outline-light btn-sm w-100">
                        ← Trở lại Trang Chủ
                    </router-link>
                </div>
            </aside>

            <main class="flex-fill p-4 bg-white rounded-start shadow-sm">
                <router-view />
            </main>
        </div>

        <footer class="admin-footer text-center py-3 mt-auto border-top">
            <p class="mb-0 small text-secondary">
                &copy; 2025 <b>KaynStyle Admin</b> — All rights reserved.
            </p>
        </footer>
    </div>
</template>

<style scoped>
.admin-layout {
    font-family: "Poppins", sans-serif;
    background-color: #f9f9f9;
}

.sidebar {
    width: 230px;
    min-height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    background: #000000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.nav-link {
    display: block;
    background-color: transparent;
    color: #ddd;
    font-weight: 500;
    border-radius: 8px;
    padding: 10px 12px;
    text-decoration: none;
    transition: 0.3s;
}

.nav-link:hover {
    background-color: #6ba9ac;
    color: #fff;
}

.active-link {
    background-color: #15c5d1;
    color: #000000 !important;
    font-weight: bold;
}

main {
    background-color: #fff;
    border-radius: 12px;
    margin: 20px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.admin-footer {
    background: #111;
    color: #bbb;
}

.admin-footer b {
    color: #10e5f8;
}

@media (max-width: 991px) {
    .d-flex {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        height: auto;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 1rem;
    }

    .sidebar ul {
        flex-direction: row !important;
    }

    main {
        margin: 0;
        border-radius: 0;
    }
}
</style>
