<script lang="ts" setup>
import { ArrowLeft12Filled, Bot20Filled } from '@vicons/fluent'
import { usePageLang } from '@vuepress/client'
import { useApi } from '../../composables/use-api'
import { useApiMethod } from '../../composables/use-api-method'
import { useProfilePhoto } from '../../composables/use-profile-photo'
import GrammyError from './GrammyError.vue'
import ManageWebhook from './ManageWebhook.vue'
import { getTranslation } from './translations'
import WebhookInfo from './WebhookInfo.vue'

import {
  darkTheme, NAlert, NAvatar, NButton,
  NCard,
  NCheckbox, NConfigProvider, NForm,
  NFormItem, NIcon, NInput, NSpace, NSpin, NTabPane, NTabs, NThemeEditor, type GlobalThemeOverrides
} from 'naive-ui'

import {
  computed,
  ref,
  watch
} from 'vue'

/**
 * Layout
 */
const dev = ref(__VUEPRESS_DEV__)

const lang = usePageLang()
const translation = computed(() => getTranslation(lang.value))

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#009dcaFF',
    primaryColorHover: '#27b5e6FF',
    primaryColorPressed: '#009dcaFF',
    primaryColorSuppl: '#138cb3FF',
    bodyColor: '#38404a',
    cardColor: '#38404AFF'
  }
}

/**
 * Orchestration
 */
const webhookInfo = ref<typeof WebhookInfo | null>(null)
const manageWebhook = ref<typeof ManageWebhook | null>(null)

const refreshWebhookInfo = () => webhookInfo.value?.refresh()
const setWebhookUrl = (url: string) => {
  manageWebhook.value?.setUrl(url)
}

const { api, token } = useApi()
const { loading: botInfoLoading, error: botInfoError, data: botInfo, refresh: botInfoRefresh } = useApiMethod(api, 'getMe')
const botName = computed(() => botInfo.value ? `${[ botInfo.value.first_name, botInfo.value.last_name ].join(' ')}` : '')

const { url: photoUrl, refresh: photoRefresh } = useProfilePhoto(api)

watch(botInfo, (info) => {
  if (!info) return
  photoRefresh(info.id, token.value)
})

const resetBot = () => {
  botInfo.value = undefined
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" :theme="darkTheme">
    <n-theme-editor v-if="dev">
      <n-space vertical v-if="!botInfo">
        <n-alert :title="translation.tokenCard.disclaimer.title" type="warning">
          {{ translation.tokenCard.disclaimer.content }}
        </n-alert>
        <n-card size="small">
          <n-form>
            <n-form-item :label="translation.tokenCard.fields.token.label">
              <n-input :readonly="botInfoLoading" v-model:value="token"
                :placeholder="translation.tokenCard.fields.token.placeholder" clearable />
            </n-form-item>
            <GrammyError :error="botInfoError" closable @retry="botInfoRefresh" />
            <n-space justify="end">
              <n-button type="primary" :disabled="!token || botInfoLoading" :loading="botInfoLoading"
                @click="() => botInfoRefresh()">
                {{ translation.tokenCard.buttons.loadBotInfo }}
              </n-button>
            </n-space>
          </n-form>
        </n-card>
      </n-space>
      <n-card v-if="botInfo" style="margin-top: 10px;" size="small" :segmented="{ content: true }">
        <template #header>
          <n-space align="center">
            <n-avatar round :src="photoUrl">
              <template #fallback>
                <n-icon>
                  <bot20-filled />
                </n-icon>
              </template>
              <n-spin size="small" v-if="!photoUrl" />
            </n-avatar>
            {{ botName }}
          </n-space>
        </template>
        <template #header-extra>
          {{ `ID: ${botInfo.id}` }}
        </template>
        <n-space justify="center" style="margin-top: 20px;">
          <n-checkbox :checked="botInfo.can_join_groups" readonly>{{ translation.botCard.canJoinGroups }}</n-checkbox>
          <n-checkbox :checked="botInfo.can_read_all_group_messages" readonly>{{
          translation.botCard.canReadGroupMessages }}</n-checkbox>
          <n-checkbox :checked="botInfo.supports_inline_queries" readonly>{{ translation.botCard.inlineQueries }}
          </n-checkbox>
        </n-space>
        <n-tabs type="segment" animated style="margin-top: 20px;">
          <n-tab-pane name="webhookInfo" :tab="translation.botCard.tabs.webhookInfo" display-directive="show">
            <WebhookInfo :api="api" ref="webhookInfo" @url-change="setWebhookUrl" />
          </n-tab-pane>
          <n-tab-pane name="manageWebhook" :tab="translation.botCard.tabs.manageWebhook" display-directive="show">
            <ManageWebhook :api="api" ref="manageWebhook" @webhook-change="refreshWebhookInfo" />
          </n-tab-pane>
        </n-tabs>
        <template #action>
          <n-button text @click="resetBot">
            <template #icon>
              <arrow-left12-filled />
            </template>
            {{ translation.botCard.buttons.changeToken }}
          </n-button>
        </template>
      </n-card>
    </n-theme-editor>
  </n-config-provider>
</template>
