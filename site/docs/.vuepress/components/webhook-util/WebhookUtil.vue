<script lang="ts" setup>
import { UserFromGetMe } from '@grammyjs/types'
import { usePageLang } from '@vuepress/client'
import { computed, ref } from 'vue'
import InfoUi from './InfoUi.vue'
import TokenUi from './TokenUi.vue'
import { getTranslation } from './translations'

const lang = usePageLang()
const translation = computed(() => getTranslation(lang.value))

const token = ref('')
const botInfo = ref<UserFromGetMe>()
</script>
<template>
  <div class="webhook-util">
    <token-ui v-if="!botInfo" :token="token" :strings="translation" @load="t => token = t" />
    <info-ui v-else :strings="translation" />
  </div>
</template>
<style scoped>
.webhook-util {
  margin-top: 30px;
}
</style>