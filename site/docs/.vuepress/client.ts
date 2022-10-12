import { defineClientConfig } from '@vuepress/client'
import { defineAsyncComponent } from 'vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component(
      'SetWebhookUtil',
      defineAsyncComponent(
        () => import('./components/set-webhook-util/SetWebhookUtil.vue')
      )
    )
  }
})
