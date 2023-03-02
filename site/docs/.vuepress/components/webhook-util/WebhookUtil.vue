<script lang="ts" setup>
import { UserFromGetMe } from '@grammyjs/types'
import { usePageLang } from '@vuepress/client'
import { type Ref, computed, ref } from 'vue'
import InfoUi from './InfoUi.vue'
import TokenUi from './TokenUi.vue'
import { getTranslation } from './translations'

const lang = usePageLang()
const translation = computed(() => getTranslation(lang.value))

const token = ref('')
const botInfo = ref<UserFromGetMe>()

const updateBotInfo = (info: UserFromGetMe, _token: string) => {
  botInfo.value = info
  token.value = _token
}

const reset = () => {
  botInfo.value = undefined
  token.value = ''
  localStorage.removeItem('botToken')
}
</script>
<template>
  <div class="webhook-util">
    <token-ui v-if="!botInfo" :token="token" :strings="translation" @info="updateBotInfo" />
    <info-ui v-else :strings="translation" :info="botInfo" :token="token" @reset="reset" />
  </div>
</template>
<style scoped>
.webhook-util {
  margin-top: 30px;
}
</style>