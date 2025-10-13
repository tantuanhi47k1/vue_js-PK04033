// src/store/modules/cart.js
import axios from 'axios';

const state = {
    cart: []
};

const mutations = {
    SET_CART(state, cartData) {
        state.cart = cartData;
    },
    ADD_TO_CART(state, product) {
        const productInCart = state.cart.find(item => item.id === product.id);
        if (productInCart) {
            productInCart.quantity++;
        } else {
            state.cart.push({ ...product, quantity: 1 });
        }
    },
    DELETE_CART(state, id) {
        state.cart = state.cart.filter(item => item.id !== id);
    },
    DELETE_ALL_CART(state) {
        state.cart = [];
    },
    DECREASE_QUANTITY(state, id) {
        const productInCart = state.cart.find(item => item.id === id);
        if (productInCart && productInCart.quantity > 1) {
            productInCart.quantity--;
        }
    },
    INCREASE_QUANTITY(state, id) {
        const productInCart = state.cart.find(item => item.id === id);
        if (productInCart && productInCart.quantity < 100) {
            productInCart.quantity++;
        }
    }
};

const actions = {
    // 1. Tải giỏ hàng từ API
    async fetchCart({ commit }) {
        try {
            const { data } = await axios.get('http://localhost:3000/cart');
            commit('SET_CART', data);
        } catch (err) {
            console.error('Lỗi khi tải giỏ hàng:', err);
        }
    },

    // 2. Thêm sản phẩm vào giỏ hàng (logic đã được cải tiến)
    async addProductToCart({ dispatch }, product) {
        try {
            const { data: existingItems } = await axios.get(`http://localhost:3000/cart?id=${product.id}`);
            const existingItem = existingItems[0];

            if (existingItem) {
                // Nếu sản phẩm đã có, cập nhật số lượng (PATCH)
                await axios.patch(`http://localhost:3000/cart/${existingItem.id}`, {
                    quantity: existingItem.quantity + 1
                });
            } else {
                // Nếu chưa có, thêm mới (POST)
                await axios.post('http://localhost:3000/cart', { ...product, quantity: 1 });
            }
            // Tải lại toàn bộ giỏ hàng từ server để đảm bảo dữ liệu luôn đồng bộ
            dispatch('fetchCart');
        } catch (err) {
            console.error('Lỗi khi thêm sản phẩm:', err);
        }
    },

    // 3. Xóa một sản phẩm
    async deleteCart({ commit }, id) {
        try {
            await axios.delete(`http://localhost:3000/cart/${id}`);
            commit('DELETE_CART', id); // Cập nhật state sau khi API thành công
        } catch (err) {
            console.error('Lỗi khi xóa sản phẩm:', err);
        }
    },

    // 4. Xóa toàn bộ giỏ hàng
    async deleteAllCart({ commit, state }) {
        try {
            // Lặp qua từng item và gửi yêu cầu xóa
            const deletePromises = state.cart.map(item => axios.delete(`http://localhost:3000/cart/${item.id}`));
            await Promise.all(deletePromises);
            commit('DELETE_ALL_CART');
        } catch (err) {
            console.error('Lỗi khi xóa toàn bộ giỏ hàng:', err);
        }
    },

    // 5. Giảm số lượng
    async decreaseQuantity({ commit, state }, id) {
        const productInCart = state.cart.find(item => item.id === id);
        if (productInCart && productInCart.quantity > 1) {
            try {
                await axios.patch(`http://localhost:3000/cart/${id}`, {
                    quantity: productInCart.quantity - 1
                });
                commit('DECREASE_QUANTITY', id);
            } catch (err) {
                console.error('Lỗi khi giảm số lượng:', err);
            }
        }
    },

    // 6. Tăng số lượng
    async increaseQuantity({ commit, state }, id) {
        const productInCart = state.cart.find(item => item.id === id);
        if (productInCart) {
            try {
                await axios.patch(`http://localhost:3000/cart/${id}`, {
                    quantity: productInCart.quantity + 1
                });
                commit('INCREASE_QUANTITY', id);
            } catch (err) {
                console.error('Lỗi khi tăng số lượng:', err);
            }
        }
    }
};

const getters = {
    cartItems: state => state.cart,
    cartTotal: state => {
        return state.cart.reduce((total, product) => {
            return total + product.discount * product.quantity;
        }, 0);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};