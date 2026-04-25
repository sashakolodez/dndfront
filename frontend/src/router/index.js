import {createRouter, createWebHistory} from "vue-router";
import TestComponent from "@/components/TestComponent.vue";
import FormCreateNewWorldComponent from "@/components/FormCreateNewWorldComponent.vue";
import RegistrationComponent from "@/components/RegistrationComponent.vue";
import GameComponent from "@/components/GameComponent.vue";

export default createRouter({
    history:createWebHistory(),
    routes: [
        {
            path: '/main',
            component: TestComponent
        },
        {
            path: '/form',
            component: FormCreateNewWorldComponent
        },
        {
            path: '/registration',
            component: RegistrationComponent
        },
        {
            path: '/game',
            component: GameComponent
        }
    ]
})