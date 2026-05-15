import { createStore } from 'vuex';
import GameState from "@/store/modules/game/game.state.js";
import UserState from "@/store/modules/user/user.state.js";

const store = createStore({
    modules: {
        GameState,
        UserState
    }
})

export default store;