import type { Bot, GrammyError } from 'grammy'
import { ref, type Ref } from 'vue'

export function useSetWebhook(bot: Ref<Bot | undefined>) {
  const success = ref<boolean | null>(null)
  const loading = ref(false)
  const error = ref<GrammyError>()

  const url = ref('')
  const secret = ref('')
  const dropUpdates = ref(false)

  async function setWebhook() {
    if (!bot.value || !url.value) return
    loading.value = true

    await bot.value?.api
      .setWebhook(url.value, {
        drop_pending_updates: dropUpdates.value,
        secret_token: secret.value || undefined
      })
      .then(() => {
        success.value = true
      })
      .catch((err) => {
        error.value = err
      })

    loading.value = false
  }

  return {
    success,
    loading,
    error,
    url,
    secret,
    dropUpdates,
    refresh: setWebhook
  }
}
