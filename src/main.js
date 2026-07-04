import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import directives from './directives'
import router from './router'
import 'overlayscrollbars/overlayscrollbars.css'
import { css, fontFamilyFallback } from './assets/fonts/TaiwanPearl-Regular.ttf'
import './assets/css/tooltip.css'
import './assets/css/buttons.css'
import './style.css'
import App from './App.vue'
import { OverlayScrollbars, ClickScrollPlugin } from 'overlayscrollbars'

document.documentElement.style.setProperty('--font-family-base', `"${css.family}", ${fontFamilyFallback}`)

OverlayScrollbars.plugin(ClickScrollPlugin)

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(directives)
app.use(router)

app.mount('#app')
