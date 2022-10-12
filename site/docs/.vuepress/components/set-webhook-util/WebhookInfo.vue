<script setup lang="ts">
import type { Bot } from 'grammy'
import { NButton, NEmpty, NSpin } from 'naive-ui'
import { toRefs, watch } from 'vue'
import { useWebhookInfo } from '../../composables/use-webhook-info'

type Props = {
  bot: Bot
}

const _props = defineProps<Props>()
const props = toRefs(_props)

const { error, loading, webhookInfo, refresh } = useWebhookInfo(props.bot)

defineExpose({
  refresh
})

const emit = defineEmits([ 'urlChange' ])

watch(webhookInfo, (value) => value?.url && emit('urlChange', value.url), { immediate: true })
</script>

<template>
  <n-spin :show="loading">
    <template v-if="webhookInfo">
      <template v-if="webhookInfo.url">
        {{ webhookInfo }}
      </template>
      <template v-else>
        <n-empty description="No webhook set">
          <template #extra>
            <n-button size="small" @click="refresh">
              Refresh
            </n-button>
          </template>
        </n-empty>
      </template>
    </template>
  </n-spin>
</template>