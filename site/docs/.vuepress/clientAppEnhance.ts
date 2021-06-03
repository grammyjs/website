import { defineClientAppEnhance } from '@vuepress/client'
import RouterPrefetch from 'vue-router-prefetch'

export default defineClientAppEnhance(({ app }) => {
    app.use(RouterPrefetch)
})
