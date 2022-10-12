import type { Bot, GrammyError } from 'grammy'
import { ref, type Ref } from 'vue'

export function useDeleteWebhook(bot: Ref<Bot | undefined>) {
  const success = ref<boolean | null>(null)
  const loading = ref(false)
  const error = ref<GrammyError>()

  async function deleteWebhook() {
    if (!bot.value) return
    success.value = null
    error.value = undefined
    loading.value = true

    await bot.value?.api
      .deleteWebhook()
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
    deleteWebhook
  }
}
