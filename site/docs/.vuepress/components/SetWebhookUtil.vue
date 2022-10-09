<script lang="ts" setup>
import { type UserFromGetMe, type WebhookInfo } from '@grammyjs/types'
import { usePageLang } from '@vuepress/client'
import { darkTheme, NButton, NCard, NCheckbox, NConfigProvider, NDivider, NForm, NFormItem, NInput, NSpace, NSwitch, NTabPane, NTabs, NThemeEditor, NThing, type GlobalThemeOverrides } from 'naive-ui'
import { computed, ref } from 'vue'


/**
 * Values
 */
const token = ref('298746736:AAEMxN8viy7v8wCHbnP7Kae9hbHx0locM7I')
const url = ref('')
const secret = ref('')
const dropUpdates = ref(false)

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

/**
 * Webhook
 */
const webhookInfo = ref<WebhookInfo>()
const loadingWebhookInfo = ref(false)
const webhookInfoError = ref<Error>()
async function getWebhookInfo () {
  if (!token.value) return
  loadingWebhookInfo.value = true

  try {
    const response = await fetch(`https://api.telegram.org/bot${token.value}/getWebhookInfo`)
    if (!response.ok) throw new Error(`Error fetching bot data: ${await response.text()}`)

    webhookInfo.value = await response.json().then((data: { ok: true, result: WebhookInfo }) => data.result)
  } catch (err) {
    if (err instanceof Error) {
      webhookInfoError.value = err
      return
    }

    webhookInfoError.value = new Error(err as any)
  }

  loadingWebhookInfo.value = false
}

/**
 * Bot Info
 */
const botInfo = ref<UserFromGetMe>()
const botName = computed(() => botInfo.value ? `${[ botInfo.value.first_name, botInfo.value.last_name ].join(' ')} (@${botInfo.value.username})` : '')
const loadingBotInfo = ref(false)
const botInfoError = ref<Error>()

async function getMe () {
  if (!token.value) return
  loadingBotInfo.value = true

  try {
    const response = await fetch(`https://api.telegram.org/bot${token.value}/getMe`)
    if (!response.ok) throw new Error(`Error fetching bot data: ${await response.text()}`)

    botInfo.value = await response.json().then((data: { ok: true, result: UserFromGetMe }) => data.result)

    getWebhookInfo()
  } catch (err) {
    if (err instanceof Error) {
      botInfoError.value = err
      return
    }

    botInfoError.value = new Error(err as any)
  }

  loadingBotInfo.value = false
}

/**
 * Loading status
 */

const loading = computed(() => loadingWebhookInfo.value)
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" :theme="darkTheme">
    <n-theme-editor v-if="dev">
      <n-card size="small" v-if="!botInfo">
        <n-form>
          <n-form-item :label="strings.token.label">
            <n-input :loading="loadingBotInfo" :readonly="loading" v-model:value="token"
              :placeholder="strings.token.placeholder" />
          </n-form-item>
          <n-space justify="end">
            <n-button type="primary" :disabled="!token || loadingBotInfo" :loading="loadingBotInfo" @click="getMe">Load
              Bot Info
            </n-button>
          </n-space>
        </n-form>
      </n-card>
      <n-card v-if="botInfo" style="margin-top: 10px;" size="small">
        <n-thing :title="botName" :title-extra="`ID: ${botInfo.id}`" content-indented>
          <n-space justify="center">
            <n-checkbox :checked="botInfo.can_join_groups" readonly>Can join groups</n-checkbox>
            <n-checkbox :checked="botInfo.can_read_all_group_messages" readonly>Can read all group messages
            </n-checkbox>
            <n-checkbox :checked="botInfo.supports_inline_queries" readonly>Supports inline queries</n-checkbox>
          </n-space>
        </n-thing>
        <n-divider />
        <n-tabs type="segment" animated style="margin-top: 20px;">
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
          <n-tab-pane name="webhookInfo" tab="Webhook Info">
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </n-theme-editor>
  </n-config-provider>
</template>

