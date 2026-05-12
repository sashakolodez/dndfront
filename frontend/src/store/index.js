import { createStore } from 'vuex';
import GameState from "@/store/modules/game/game.state.js";

const store = createStore({
    modules: {
        GameState
    }
})

export default store;