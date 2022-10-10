<script lang="ts" setup>
import { ArrowLeft12Filled, Bot20Filled } from '@vicons/fluent'
import { usePageLang } from '@vuepress/client'
import { useBot } from '../composables/use-bot'
import { useSetWebhook } from '../composables/use-set-webhook'
import { useWebhookInfo } from '../composables/use-webhook-info'

import {
  darkTheme, NAlert, NAvatar, NButton,
  NCard,
  NCheckbox, NConfigProvider, NEmpty, NForm,
  NFormItem, NIcon, NInput, NSpace, NSpin, NSwitch,
  NTabPane, NTabs, NThemeEditor, type GlobalThemeOverrides
} from 'naive-ui'

import {
  computed,
  ref
} from 'vue'

/**
 * Layout
 */
const dev = ref(__VUEPRESS_DEV__)
const lang = usePageLang()
const strings = computed(() => __SETWEBHOOKUTIL_STRINGS__[ lang.value ])

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

const { bot, error: botError, loading: botLoading, refresh: getMe, token, reset: resetBot } = useBot()
const botName = computed(() => bot.value ? `${bot.value?.botInfo.first_name} ${bot.value?.botInfo.last_name || ''}`.trim() : '')
const { error: webhookInfoError, loading: webhookInfoLoading, webhookInfo, refresh: getWebhookInfo } = useWebhookInfo(bot)
const { error: setWebhookError, loading: setWebhookLoading, success: setWebhookSuccess, refresh: setWebhook, ...setWebhookParams } = useSetWebhook(bot)
const { dropUpdates, secret, url } = setWebhookParams

async function init () {
  await getMe()
  await getWebhookInfo()
  if (webhookInfo.value && !webhookInfoError.value && webhookInfo.value.url) url.value = webhookInfo.value.url
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" :theme="darkTheme">
    <n-theme-editor v-if="dev">
      <n-space vertical v-if="!bot">
        <n-alert title="About your bot token" type="warning">
          We never store your bot's token in the backend. It is stored in your browser's <i>localStorage</i>. Do not go
          around giving your token to random websites, no matter how nicely they ask!
        </n-alert>
        <n-card size="small">
          <n-form>
            <n-form-item :label="strings.token.label">
              <n-input :readonly="botLoading" v-model:value="token" :placeholder="strings.token.placeholder" />
            </n-form-item>
            <n-space justify="end">
              <n-button type="primary" :disabled="!token || botLoading" :loading="botLoading" @click="init">
                Load Bot Info
              </n-button>
            </n-space>
          </n-form>
        </n-card>
      </n-space>
      <n-card v-if="bot" style="margin-top: 10px;" size="small" :segmented="{ content: true }">
        <template #header>
          <n-space align="center">
            <n-avatar>
              <n-icon>
                <bot20-filled />
              </n-icon>
            </n-avatar>
            {{ botName }}
          </n-space>
        </template>
        <template #header-extra>
          {{ `ID: ${bot.botInfo.id}` }}
        </template>
        <n-space justify="center" style="margin-top: 20px;">
          <n-checkbox :checked="bot.botInfo.can_join_groups" readonly>Can join groups</n-checkbox>
          <n-checkbox :checked="bot.botInfo.can_read_all_group_messages" readonly>Can read all group messages
          </n-checkbox>
          <n-checkbox :checked="bot.botInfo.supports_inline_queries" readonly>Supports inline queries</n-checkbox>
        </n-space>
        <n-tabs type="segment" animated style="margin-top: 20px;">
          <n-tab-pane name="webhookInfo" tab="Webhook Info">
            <n-spin :show="webhookInfoLoading">
              <template v-if="webhookInfo">
                <template v-if="webhookInfo.url">

                </template>
                <template v-else>
                  <n-empty description="No webhook set" />
                </template>
              </template>
            </n-spin>
          </n-tab-pane>
          <n-tab-pane name="manageWebhook" tab="Manage Webhook">
            <n-form label-placement="left" style="margin-top: 10px">
              <n-form-item :label="strings.url.label">
                <n-input :placeholder="strings.url.placeholder" v-model="url" />
              </n-form-item>
              <n-form-item label="Webhook Secret">
                <n-input placeholder="Secret value telegram sends to your bot" v-model="secret" />
              </n-form-item>
              <n-form-item label="Drop pending updates">
                <n-switch v-model="dropUpdates" />
              </n-form-item>
              <n-space justify="end">
                <n-button type="error">{{ strings.buttons.deleteWebhook }}</n-button>
                <n-button type="primary">{{ strings.buttons.setWebhook }}</n-button>
              </n-space>
            </n-form>
          </n-tab-pane>
        </n-tabs>
        <template #action>
          <n-button text @click="resetBot">
            <template #icon>
              <arrow-left12-filled />
            </template>
            Change token
          </n-button>
        </template>
      </n-card>
    </n-theme-editor>
  </n-config-provider>
</template>

<style scoped>

</style>