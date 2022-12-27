<script setup lang="ts">
import { usePageLang } from '@vuepress/client'
import type { Api } from 'grammy/web'
import { computed, ref, toRefs } from 'vue'
import { useDeleteWebhook } from '../../composables/use-delete-webhook'
import { useSetWebhook } from '../../composables/use-set-webhook'
import { NButton, NForm, NFormItem, NInput, NSpace, NSwitch } from './deps'
import GrammyError from './GrammyError.vue'
import { getTranslation } from './translations'

const lang = usePageLang()
const translation = computed(() => getTranslation(lang.value).manageWebhook)

type Props = {
  api: Api | undefined
}

const _props = defineProps<Props>()
const props = toRefs(_props)

const dropPendingUpdates = ref(false)
const { error: setWebhookError, loading: setWebhookLoading, setWebhook, secretToken, url } = useSetWebhook(props.api, { dropPendingUpdates })
const { error: deleteWebhookError, loading: deleteWebhookLoading, deleteWebhook } = useDeleteWebhook(props.api, dropPendingUpdates)
const webhookLoading = computed(() => setWebhookLoading.value || deleteWebhookLoading.value)

const emit = defineEmits([ 'webhookChange' ])
const withRefreshWebhookInfo = (fn: () => Promise<any>) => fn().then(() => emit('webhookChange'))

const urlRule = {
  required: true,
  validator: () => {
    if (!url.value) return new Error(translation.value.fields.url.errorMessages.required)

    try {
      const urlObj = new URL(url.value)

      if (urlObj.protocol.replace(':', '') !== 'https') return new Error(translation.value.fields.url.errorMessages.protocol)

      return true
    } catch (err) {
      return new Error(translation.value.fields.url.errorMessages.invalid)
    }
  },
  trigger: [ 'blur', 'input' ]
}

const setUrl = (newUrl: string) => { url.value = newUrl }
defineExpose({ setUrl })
</script>

<template>
  <n-form label-placement="top" style="margin-top: 10px">
    <n-form-item :label="translation.fields.url.label" path="url" style="margin-bottom: 10px" :rule="urlRule">
      <n-input :readonly="webhookLoading" :placeholder="translation.fields.url.placeholder" v-model:value="url" />
    </n-form-item>
    <n-form-item :label="translation.fields.secret.label">
      <n-input :readonly="webhookLoading" :placeholder="translation.fields.secret.placeholder"
        v-model:value="secretToken" />
    </n-form-item>
    <n-form-item :label="translation.fields.dropPending.label">
      <n-switch :readonly="webhookLoading" v-model:value="dropPendingUpdates" />
    </n-form-item>
    <grammy-error :error="setWebhookError" @retry="withRefreshWebhookInfo(setWebhook)" :retriable="false" />
    <grammy-error :error="deleteWebhookError" @retry="withRefreshWebhookInfo(deleteWebhook)" />
    <n-space justify="end">
      <n-button type="error" @click="withRefreshWebhookInfo(deleteWebhook)" :loading="deleteWebhookLoading"
        :disabled="setWebhookLoading">
        {{ translation.buttons.deleteWebhook }}
      </n-button>
      <n-button type="primary" @click="withRefreshWebhookInfo(setWebhook)" :loading="setWebhookLoading"
        :disabled="deleteWebhookLoading || !url">
        {{ translation.buttons.setWebhook }}
      </n-button>
    </n-space>
  </n-form>
</template>