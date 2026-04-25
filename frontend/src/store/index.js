import { createStore } from 'vuex';
import UserState from "@/store/modules/users/user.state.js";
import ProductState from "@/store/modules/Product/product.state.js";

const store = createStore({
    modules: {
        UserState,
        ProductState
    }
})

export default store;