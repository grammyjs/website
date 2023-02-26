<script lang="ts" setup>
import { usePageLang } from '@vuepress/client'
import { computed } from 'vue'
import TokenUi from './TokenUi.vue'
import InfoUi from './InfoUi.vue'
import { getTranslation } from './translations'

const lang = usePageLang()
const translation = computed(() => getTranslation(lang.value))
</script>
<template>
  <div class="webhook-util">
    <!-- <token-ui :strings="translation" /> -->
    <info-ui :strings="translation" />
  </div>
</template>
<style scoped>
.webhook-util {
  margin-top: 30px;
}
</style>