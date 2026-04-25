import axios from "axios";

const state = {
    users: null,
    user: null,
    accessToken: null,
    status: null
}

const getters = {
    USERS: state => {
        return state.users;
    },
    USER: state => {
        return state.user
    },
    ACCESSTOKEN: state => {
        return state.accessToken;
    },
    STATUS: state => {
        return state.status
    }
}

const mutations = {
    setAccessToken(state, accessToken) {
        state.accessToken = accessToken
    },
    setUsers(state, users) {
        state.users = users
    },
    setUser(state, user) {
        state.user = user
    },
    setStatus(state, status) {
        state.status = status
    }
}

const actions = {
    async auth({commit, state}, user) {
        const response = await axios.post('/login', {
                username: user.username,
                email: user.email,
                password: user.password
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
        commit('setAccessToken', response.data.accessToken)
        localStorage.accessToken = state.accessToken

    },

    async registration({commit}, user) {
        await axios.post('/registration', {
                username: user.username,
                email: user.email,
                password: user.password
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
    },

    async getUser({commit}){
        const response = await axios.get('/user', {
            headers: {
                'Authorization': localStorage.getItem('accessToken')
            }
        })
        commit('setUser', response.user)
        commit('setStatus', response)
    },
}

export default {
    state,
    mutations,
    getters,
    actions
}