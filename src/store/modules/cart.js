// src/store/modules/cart.js
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = "http://localhost:3000/cart";

const state = {
  cart: [],
};

const mutations = {
  SET_CART(state, cartData) {
    state.cart = cartData;
  },
  ADD_TO_CART(state, product) {
    const productInCart = state.cart.find((item) => item.productId === product.id);
    if (productInCart) {
      productInCart.quantity++;
    } else {
      state.cart.push({ ...product, quantity: 1 });
    }
  },
  DELETE_CART(state, id) {
    state.cart = state.cart.filter((item) => item.id !== id);
  },
  DELETE_ALL_CART(state) {
    state.cart = [];
  },
  UPDATE_QUANTITY(state, { id, quantity }) {
    const product = state.cart.find((item) => item.id === id);
    if (product) product.quantity = quantity;
  },
};

const actions = {
  // Lấy danh sách giỏ hàng từ JSON Server
  async fetchCart({ commit }) {
    try {
      const { data } = await axios.get(API_URL);
      commit("SET_CART", data);
    } catch (err) {
      console.error("❌ Lỗi khi tải giỏ hàng:", err);
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addProductToCart({ dispatch }, product) {
    try {
      // Kiểm tra xem đã có sản phẩm này trong giỏ chưa (dựa theo productId)
      const { data: existing } = await axios.get(`${API_URL}?productId=${product.id}`);
      const existingItem = existing[0];

      if (existingItem) {
        await axios.patch(`${API_URL}/${existingItem.id}`, {
          quantity: existingItem.quantity + 1,
        });
      } else {
        // Loại bỏ id cũ để tránh xung đột với /cart
        const { id, ...newProduct } = product;
        await axios.post(API_URL, {
          ...newProduct,
          productId: id,
          quantity: 1,
        });
      }

      await dispatch("fetchCart");

      Swal.fire({
        icon: "success",
        title: "Đã thêm vào giỏ hàng!",
        text: `${product.name} đã được thêm vào giỏ.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error("❌ Lỗi khi thêm sản phẩm:", err);
    }
  },

  // mua lại sp
  async addToCart({ dispatch }, product) {
    await dispatch("addProductToCart", product);
  },


  // Xóa 1 sản phẩm
  async deleteCart({ commit }, id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      commit("DELETE_CART", id);
    } catch (err) {
      console.error("❌ Lỗi khi xóa sản phẩm:", err);
    }
  },

  // Xóa toàn bộ giỏ hàng
  async deleteAllCart({ commit, state }) {
    try {
      const deleteRequests = state.cart.map((item) =>
        axios.delete(`${API_URL}/${item.id}`)
      );
      await Promise.all(deleteRequests);
      commit("DELETE_ALL_CART");
    } catch (err) {
      console.error("❌ Lỗi khi xóa toàn bộ giỏ hàng:", err);
    }
  },

  // Giảm số lượng
  async decreaseQuantity({ commit, state }, id) {
    const product = state.cart.find((item) => item.id === id);
    if (!product || product.quantity <= 1) return;

    try {
      await axios.patch(`${API_URL}/${id}`, {
        quantity: product.quantity - 1,
      });
      commit("UPDATE_QUANTITY", { id, quantity: product.quantity - 1 });
    } catch (err) {
      console.error("❌ Lỗi khi giảm số lượng:", err);
    }
  },

  // Tăng số lượng
  async increaseQuantity({ commit, state }, id) {
    const product = state.cart.find((item) => item.id === id);
    if (!product || product.quantity >= 100) return;

    try {
      await axios.patch(`${API_URL}/${id}`, {
        quantity: product.quantity + 1,
      });
      commit("UPDATE_QUANTITY", { id, quantity: product.quantity + 1 });
    } catch (err) {
      console.error("❌ Lỗi khi tăng số lượng:", err);
    }
  },
};

const getters = {
  cartItems: (state) => state.cart,
  cartItemCount: (state) =>
    state.cart.reduce((total, item) => total + (item.quantity || 1), 0),
  cartTotal: (state) =>
    state.cart.reduce((total, product) => {
      const price = product.discount ?? product.price ?? 0;
      return total + price * (product.quantity || 1);
    }, 0),
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
