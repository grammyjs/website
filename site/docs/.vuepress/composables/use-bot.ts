import { Bot, GrammyError } from 'grammy'
import { ref, watch } from 'vue'

export function useBot() {
  const bot = ref<Bot>()
  const loading = ref(false)
  const error = ref<GrammyError>()
  const token = ref(localStorage.getItem('token') || '')

  watch(token, (value) => localStorage.setItem('token', value))

  async function init() {
    if (!token.value) return
    loading.value = true

    const botInstance = new Bot(token.value)

    await botInstance
      .init()
      .then(() => {
        bot.value = botInstance
      })
      .catch((err) => {
        bot.value = undefined
        error.value = err
      })

    loading.value = false
  }

  function reset() {
    bot.value = undefined
    token.value = ''
  }

  return {
    bot,
    loading,
    error,
    token,
    refresh: init,
    reset
  }
}
