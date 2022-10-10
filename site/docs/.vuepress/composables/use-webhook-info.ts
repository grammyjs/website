import type { WebhookInfo } from '@grammyjs/types'
import type { Bot } from 'grammy'
import { ref, type Ref } from 'vue'

export function useWebhookInfo(bot: Ref<Bot | undefined>) {
  const webhookInfo = ref<WebhookInfo>()
  const loading = ref(false)
  const error = ref<Error>()

  async function getWebhookInfo() {
    if (!bot.value) return
    loading.value = true

    await bot.value.api
      .getWebhookInfo()
      .then((info) => {
        webhookInfo.value = info
      })
      .catch((err) => {
        error.value = err
      })

    loading.value = false
  }

  return {
    webhookInfo,
    loading,
    error,
    refresh: getWebhookInfo
  }
}
