<script setup lang="ts">
import { computed } from '@vue/reactivity'
import { usePageLang } from '@vuepress/client'
import type { GrammyError } from 'grammy'
import { NAlert, NButton, NSpace } from 'naive-ui'
import { getTranslation } from './translations'

const lang = usePageLang()
const translation = computed(() => getTranslation(lang.value).error)

type Props = {
  error: GrammyError | undefined
  closable: boolean
  retriable: boolean
}

withDefaults(defineProps<Props>(), { closable: false, retriable: true })

const emit = defineEmits([ 'retry' ])

const retry = () => emit('retry')
</script>

<template>
  <n-alert type="error" v-if="error" :title="error.description || error.message" style="margin-bottom: 20px"
    :closable="closable">
    <n-space vertical>
      <span>{{ error.error_code }} {{error.description ? error.message : ''}}</span>
      <n-button ghost type="error" v-if="retriable" @click="retry">{{ translation.buttons.retry }}</n-button>
    </n-space>
  </n-alert>
</template>
