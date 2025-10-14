const state = {
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || []
};

const mutations = {
    ADD_TO_WISHLIST(state, product) {
        const productInWishlist = state.wishlist.find(item => item.id === product.id);
        if (!productInWishlist) {
            state.wishlist.push(product);
        }
        localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    },
    REMOVE_FROM_WISHLIST(state, productId) {
        state.wishlist = state.wishlist.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    }
};

const actions = {
    addToWishlist({ commit }, product) {
        commit('ADD_TO_WISHLIST', product);
    },
    removeFromWishlist({ commit }, productId) {
        commit('REMOVE_FROM_WISHLIST', productId);
    }
};

const getters = {
    wishlist: state => state.wishlist,
    isInWishlist: (state) => (productId) => {
        return state.wishlist.some(item => item.id === productId);
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};