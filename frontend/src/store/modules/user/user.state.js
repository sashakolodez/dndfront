import axios from "axios";
import {WorldCollection} from "@/store/models/Worlds.js";

const state = {
    world: null,
    }

const getters = {
    WORLD: state => {
        return state.world
    },
}

const mutations = {
    setWorld(state, data) {
        state.world = new WorldCollection(data)
    }
}

const actions = {
    async world({commit}, data) {
        const response = await axios.get('/api/v1/games', {
            params: {
                page: data.page,
                limit: data.limit
            },
            headers: {
                    'Content-Type': 'application/json'
            }
            })
        commit('setWorld', response.data)
    },
}

export default {
    state,
    mutations,
    getters,
    actions
}