import {createRouter, createWebHistory} from "vue-router";
import MainComponent from "@/components/MainComponent.vue";
import FormCreateNewWorldComponent from "@/components/FormCreateNewWorldComponent.vue";
import RegistrationComponent from "@/components/RegistrationComponent.vue";
import GameComponent from "@/components/GameComponent.vue";

export default createRouter({
    history:createWebHistory(),
    routes: [
        {
            path: '/',
            component: MainComponent
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