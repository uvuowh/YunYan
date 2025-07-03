import { createApp } from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import router from './router';
import VueKonva from 'vue-konva';

const pinia = createPinia();

createApp(App).use(router).use(pinia).use(VueKonva).mount("#app");
