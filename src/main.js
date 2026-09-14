import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vant 基础样式
import 'vant/lib/index.css'

// Leaflet 样式
import 'leaflet/dist/leaflet.css'

// 全局样式
import './styles/variables.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
