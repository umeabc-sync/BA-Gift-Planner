import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import directives from './directives'
import router from './router'
import 'overlayscrollbars/overlayscrollbars.css'
import { css as TaiwanPearl, fontFamilyFallback } from './assets/fonts/TaiwanPearl-Regular.ttf'
import { css as nexonBold, fontFamilyFallback as nexonBoldFallback } from './assets/fonts/NEXON Football Gothic B.otf'
import { css as nexonLight, fontFamilyFallback as nexonLightFallback } from './assets/fonts/NEXON Football Gothic L.otf'
import './assets/css/tooltip.css'
import './assets/css/buttons.css'
import './style.css'
import App from './App.vue'
import { OverlayScrollbars, ClickScrollPlugin } from 'overlayscrollbars'

document.documentElement.style.setProperty('--font-family-base', `"${TaiwanPearl.family}", ${fontFamilyFallback}`)
document.documentElement.style.setProperty('--font-family-nexon-bold', `"${nexonBold.family}", ${nexonBoldFallback}`)
document.documentElement.style.setProperty('--font-family-nexon-light', `"${nexonLight.family}", ${nexonLightFallback}`)

OverlayScrollbars.plugin(ClickScrollPlugin)

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(directives)
app.use(router)

app.mount('#app')
