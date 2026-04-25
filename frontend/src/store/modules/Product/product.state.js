import axios from "axios";

const state = {
    product: null
}

const getters = {
    PRODUCTS: state => {
        return state.product
    },
}

const mutations = {
    setProducts(state, products) {
        state.product = products
    }
}

const actions = {
    async addProduct({commit}, product) {
        await axios.post('/product/create', {
                name: product.name,
                description: product.description,
                price: product.price,
                tag: product.tag,
                isHot: product.isHot,
                img: product.img,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
    },

    async getProducts({commit}) {
        const response = await axios('/products')
        commit('setProducts', response.data.data)
    },

    async getProduct({commit}, productId) {
        const response = await axios(`/product/${productId}`)
        commit('setProducts', response.data.data)
    },

    async updateProduct({commit}, product) {
        await axios.post(`/product/${product.id}/update`, {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                urlImage: product.urlImage
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
    },

    async deleteProduct({commit}, productId) {
        await axios(`/product/${productId}/delete`)
    },

    async searchProduct({commit}, context) {
        const response = await axios.get(`/product/?search=${context}`)
        commit('setProducts', response.data.data)
    },
}

export default {
    state,
    mutations,
    getters,
    actions
}