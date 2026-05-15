import axios from "axios";
import { Game } from '@/store/models/Game';
import {Gamers, Health} from "@/store/models/Gamers.js";
import { Action } from "@/store/models/Action.js";
import { Dice } from "@/store/models/Dice.js";

const state = {
    game: null,
    gamer: null,
    actions: null,
    dice: null
}

const getters = {
    GAME: state => {
        return state.game
    },
    GAMER: state => {
        return state.gamer
    },
    ACTIONS: state => {
        return state.actions
    },
    DICE: state => {
        return state.dice
    }
}

const mutations = {
    setGame(state, content) {
        state.game = content ? new Game(content) : null
    },
    setGamer(state, content, id) {
        state.gamer = content ? new Gamers(id, content) : null
    },
    setStart(state, data) {
        state.game.addStartMess(data)
    },
    setAction(state, data) {
        state.gamer.inventory = data.inventory
        state.gamer.setHealthData(new Health(data.health))
        state.actions = new Action(data)
    },
    setDice(state, data) {
        state.actions = new Action(data.continue)
        state.dice = new Dice(data)
    }
}

const actions = {
    async createGame({commit}, data) {
        const response = await axios.post('/api/v1/games', {
                name: data.adventureName,
                count_gamer: data.playerCount
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        commit('setGame', response.data.data)
    },

    async startGame({commit}, id) {
        const response = await axios.post(`/api/v1/games/${id}/start`, {},
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        commit('setStart', response.data.data)
    },

    async initGamers({commit}, data) {
        const response = await axios.put('/api/v1/gamers', {
                gamer_id: data.gamer_id,
                action: data.action
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        commit('setGamer', response.data.data, data.gamer_id)
    },

    async action({commit}, data) {
        const response = await axios.post('/api/v1/actions', {
                gamer_id: data.gamer_id,
                action: data.action
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        commit('setAction', response.data.data)
    },

    async dice({commit}, data) {
        const response = await axios.post('/api/v1/actions/roll-dice',
            {
                gamer_id: data.gamer_id,
                cube: data.cube
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        commit('setDice', response.data.data)
    },

    async startBattle({commit}, gameId) {
        const response = await axios.post(`/api/v1/games/${gameId}/start-battle`, {},
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        return response.data.data
    },

    async npcAction({commit}, data) {
        const response = await axios.post(`/api/v1/actions/npc`, {
            game_id: data.gameId,
            npc_id: data.npcId
        },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        return response.data.data
    },
    async initGame({commit}, gameId) {
        const response = await axios.get(`/api/v1/games/${gameId}`, {},
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        commit('setGame', response.data.data)
    },
}

export default {
    state,
    mutations,
    getters,
    actions
}
