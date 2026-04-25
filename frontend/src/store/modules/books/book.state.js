import axios from "axios";

const state = {
    book: null,
    numPages: null
    }
const mutations = {
    setBooks(state, books) {
        state.book = books
    },

    setNumPages(state, numPages) {
        state.numPages = numPages
    }
}

const getters = {
    BOOKS: state => {
            return state.book
    },
    NUMPAGES: state => {
            return state.numPages
    }
}

const actions = {
    async getBooks({commit}) {
        const response = await axios('/main')
        commit('setBooks', response.data.data)
    },

    async getUserBooks({commit}) {
        const response = await axios.get('/books', {
            headers: {
                'Authorization': localStorage.getItem('accessToken')
            }
        })
        commit('setBooks', response.data.data)
        commit('setNumPages', response.data.numPages)
    },

    async switchPage({commit}, page) {
        const response = await axios.get(`/books`,
            {
                headers: {
                    'Authorization': localStorage.getItem('accessToken')
                }
            })
        commit('setBooks', response.data.data)
    },

    async deleteBook({commit}, bookId) {
        await axios.delete(`/book/${bookId}/delete`, {
            headers: {
                'Authorization': localStorage.getItem('accessToken')
            }
        })

        const response = await axios.get('/books', {
            headers: {
                'Authorization': localStorage.getItem('accessToken')
            }
        })
        commit('setBooks', response.data.data)
        commit('setNumPages', response.data.numPages)
    },

    async createBook({commit}, book) {
        let jsonId = JSON.stringify(book.userId)

        await axios.post('/create', {
                title: book.title,
                content: book.content,
                id: jsonId
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': localStorage.getItem('accessToken')
                }
            })
    },

    async updateBook({commit}, book) {
        let jsonId = JSON.stringify(book.userId)

        await axios.post(`/book/${book.bookId}/update`, {
                title: book.title,
                content: book.content,
                id: jsonId
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': localStorage.getItem('accessToken')
                }
            })
    },

    async getContent({commit}, bookId) {
        const response = await axios.get(`/book/${bookId}/content`)
        commit('setBooks', response.data.data)
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}