<script setup lang="ts">
import { usePageLang } from '@vuepress/client'
import type { Bot } from 'grammy'
import { NButton, NForm, NFormItem, NInput, NSpace, NSwitch } from 'naive-ui'
import { computed, toRefs } from 'vue'
import { useDeleteWebhook } from '../../composables/use-delete-webhook'
import { useSetWebhook } from '../../composables/use-set-webhook'

const lang = usePageLang()
const strings = computed(() => __SETWEBHOOKUTIL_STRINGS__[ lang.value ])

type Props = {
  bot: Bot
}

const _props = defineProps<Props>()
const props = toRefs(_props)

const { error: setWebhookError, loading: setWebhookLoading, refresh: setWebhook, dropUpdates, secret, url } = useSetWebhook(props.bot)
const { error: deleteWebhookError, loading: deleteWebhookLoading, deleteWebhook } = useDeleteWebhook(props.bot)
const webhookLoading = computed(() => setWebhookLoading.value || deleteWebhookLoading.value)

const emit = defineEmits([ 'webhookChange' ])
const withRefreshWebhookInfo = (fn: () => Promise<any>) => fn().then(() => emit('webhookChange'))

const setUrl = (newUrl: string) => { url.value = newUrl }
defineExpose({ setUrl })
</script>

<template>
  <n-form label-placement="left" style="margin-top: 10px">
    <n-form-item :label="strings.url.label">
      <n-input :readonly="webhookLoading" :placeholder="strings.url.placeholder" v-model:value="url" />
    </n-form-item>
    <n-form-item label="Webhook Secret">
      <n-input :readonly="webhookLoading" placeholder="Secret value telegram sends to your bot"
        v-model:value="secret" />
    </n-form-item>
    <n-form-item label="Drop pending updates">
      <n-switch :readonly="webhookLoading" v-model:value="dropUpdates" />
    </n-form-item>
    <n-space justify="end">
      <n-button type="error" @click="withRefreshWebhookInfo(deleteWebhook)" :loading="deleteWebhookLoading"
        :disabled="setWebhookLoading">
        {{ strings.buttons.deleteWebhook }}
      </n-button>
      <n-button type="primary" @click="withRefreshWebhookInfo(setWebhook)" :loading="setWebhookLoading"
        :disabled="deleteWebhookLoading || !url">
        {{ strings.buttons.setWebhook }}
      </n-button>
    </n-space>
  </n-form>
</template>