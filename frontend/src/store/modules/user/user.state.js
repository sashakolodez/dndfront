import axios from "axios";
import { Game } from '@/store/models/Game';
import {Gamers, Health} from "@/store/models/Gamers.js";
import { Action } from "@/store/models/Action.js";
import { Dice } from "@/store/models/Dice.js";

const state = {
    world: null,
    }

const getters = {
    WORLD: state => {
        return state.game
    },
}

const mutations = {
    setWorld(state, content) {
        state.game = content ? new Game(content) : null
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
        commit('setWorld', response.data.data)
    },
}

export default {
    state,
    mutations,
    getters,
    actions
}