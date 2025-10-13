import { createApp } from "vue";
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createPinia } from "pinia";
import store from "./store";
import App from "./App.vue";
import router from "./router/index.js";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
  },
});

const pinia = createPinia();

const app = createApp(App);

app.use(vuetify);
app.use(pinia);
app.use(store);
app.use(router);

app.mount("#app");
