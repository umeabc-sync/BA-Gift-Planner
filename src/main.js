import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'overlayscrollbars/overlayscrollbars.css'
import './assets/css/fonts.css'
import './style.css'
import App from './App.vue'
import { OverlayScrollbars, ClickScrollPlugin } from 'overlayscrollbars'

OverlayScrollbars.plugin(ClickScrollPlugin)

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)

app.mount('#app')
