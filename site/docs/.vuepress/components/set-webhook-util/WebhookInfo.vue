<script setup lang="ts">
import { CheckboxChecked16Regular } from '@vicons/fluent'
import { computed } from '@vue/reactivity'
import { usePageLang } from '@vuepress/client'
import type { Api } from 'grammy'
import { NAlert, NButton, NEmpty, NIcon, NSkeleton, NSpace, NSpin } from 'naive-ui'
import { toRefs, watch } from 'vue'
import { useApiMethod } from '../../composables/use-api-method'
import GrammyError from './GrammyError.vue'
import { getTranslation } from './translations'

type Props = {
  api: Api | undefined
}

const lang = usePageLang()
const translation = computed(() => getTranslation(lang.value).webhookInfo)
const _props = defineProps<Props>()
const props = toRefs(_props)

const { error, loading, data: webhookInfo, refresh } = useApiMethod(props.api, 'getWebhookInfo')

defineExpose({
  refresh
})

const toLocaleDateString = (timestamp?: number) => {
  const date = timestamp ? new Date(timestamp * 1000) : undefined

  return date?.toLocaleDateString(lang.value, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) ?? ''
}

const emit = defineEmits([ 'urlChange' ])

watch(props.api, () => refresh(), { immediate: true })
watch(webhookInfo, (value) => value?.url && emit('urlChange', value.url), { immediate: true })
</script>

<template>
  <n-space vertical>
    <n-spin :show="loading" size="small">
      <template v-if="loading">
        <n-space vertical align="center">
          <n-skeleton height="40px" circle />
        </n-space>
      </template>
      <template v-if="webhookInfo">
        <template v-if="!webhookInfo.url">
          <n-empty :description="translation.empty">
            <template #extra>
              <n-button size="small" @click="() => refresh()">
                {{ translation.buttons.refresh }}
              </n-button>
            </template>
          </n-empty>
        </template>
        <template v-if="webhookInfo.url">
          <n-empty :description="webhookInfo.url">
            <template #icon>
              <n-icon>
                <CheckboxChecked16Regular />
              </n-icon>
            </template>
            <template #extra>
              <n-space vertical>
                <div>
                  {{ translation.pendingUpdates(webhookInfo.pending_update_count) }}.
                </div>
                <n-button size="small" @click="() => refresh()">
                  {{ translation.buttons.refresh }}
                </n-button>
              </n-space>
            </template>
          </n-empty>
        </template>
        <template v-if="webhookInfo.last_error_message">
          <n-alert type="info" style="margin-top: 10px"
            :title="translation.lastErrorDate(toLocaleDateString(webhookInfo.last_error_date))" closable>
            <n-space vertical>
              <div>{{ webhookInfo.last_error_message }}</div>
              <div v-if="webhookInfo.last_synchronization_error_date">
                {{ translation.lastSyncErrorDate(toLocaleDateString(webhookInfo.last_synchronization_error_date)) }}
              </div>
            </n-space>
          </n-alert>
        </template>
      </template>
      <template v-if="error">
        <GrammyError :error="error" @retry="refresh" />
      </template>
    </n-spin>
  </n-space>
</template>

<style scoped>
.webhookInfo {
  margin-left: 10px;
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
}
</style>