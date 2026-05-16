import axios from "axios";
import { Game } from '@/store/models/Game';
import {GamerCollection, Gamers, Health} from "@/store/models/Gamers.js";
import { Action } from "@/store/models/Action.js";
import { Dice } from "@/store/models/Dice.js";
import { BattleInit, NPCAction } from "@/store/models/Battle.js";

const state = {
    game: null,
    gamer: null,
    actions: null,
    dice: null,
    gamers: null,
    newGame: true
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
    },
    GAMERS: state => {
        return state.gamers
    },
    NEW_GAME: state => {
        return state.newGame
    },
    BATTLE_INIT: state => {
        return state.battleInit
    },
    NPC_ACTION: state => {
        return state.npcAction
    }
}

const mutations = {
    setGame(state, content) {
        state.game = content ? new Game(content) : null
        state.newGame = true
        state.gamers = null
        state.gamer = null
        state.actions = null
        state.dice = null
        state.newGame = true
    },
    setGamer(state, content, id) {
        state.gamer = content ? new Gamers(content) : null
        if (state.gamers === null) {
            state.gamers = new GamerCollection()
            state.gamers.addGamer(state.gamer)
        }
        else {
            state.gamers.addGamer(state.gamer)
        }
        console.log(state.gamer)
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
    },
    setSearchGame (state, data) {
        state.game = data ? new Game(data) : null
        state.game.addBriefRetelling(data.brief_retelling)
        state.gamers = new GamerCollection()
        state.gamers.addGamers(data.gamers)
        state.newGame = false
    },
    setCurrentGamer(state, gamerId) {
        for (let i = 0; i < state.gamers.gamers.length; i++) {
            if (state.gamers.gamers[i].id === gamerId) {
                state.gamer = state.gamers.gamers[i]
                break
            }
        }
    },
    setBattleInit(state, data) {
        state.battleInit = data ? new BattleInit(data) : null
    },
    setNPCAction(state, data) {
        state.npcAction = data ? new NPCAction(data) : null
    },
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
        commit('setBattleInit', response.data.data)
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
        commit('setNPCAction', response.data.data)
    },

    async searchGame({commit}, gameId) {
        const response = await axios.get(`/api/v1/games/${gameId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        commit('setSearchGame', response.data.data)
    },
}

export default {
    state,
    mutations,
    getters,
    actions
}
