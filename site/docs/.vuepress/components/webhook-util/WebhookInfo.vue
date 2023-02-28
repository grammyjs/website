<script lang="ts" setup>
import { usePageLang } from '@vuepress/client'
import { useTelegramApi } from 'grammy-vue'
import { computed, onMounted, toRefs } from 'vue'
import { VAlert } from 'vuetify/components/VAlert'
import { VBtn } from 'vuetify/components/VBtn'
import { VCard, VCardText } from 'vuetify/components/VCard'
import { VContainer, VRow } from 'vuetify/components/VGrid'
import { VIcon } from 'vuetify/components/VIcon'
import { VProgressCircular } from 'vuetify/components/VProgressCircular'
import { Translation } from './translations/types'

const lang = usePageLang()

const props = defineProps<{ strings: Translation, token: string }>()
const { token } = toRefs(props)
const { useApiMethod } = useTelegramApi(token)
const { state, data: webhookInfo, error, refresh: getWebhookInfo } = useApiMethod('getWebhookInfo')

const icon = computed(() => webhookInfo.value.url ? 'mdi-web-check' : 'mdi-web-off')
const url = computed(() => webhookInfo.value.url || props.strings.webhookInfo.empty)

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

defineExpose({ refresh: getWebhookInfo })

onMounted(() => getWebhookInfo())
</script>
<template>
  <v-card :disabled="state === 'loading'">
    <v-card-text>
      <v-container>
        <div v-if="state === 'success'">
          <v-row class="mb-4" justify="center">
            <v-icon color="grey-darken-1" size="40" :icon="icon"></v-icon>
          </v-row>
          <v-row class="my-2" justify="center">
            <span class="text-body-2 text-grey-darken-1">{{ url }}</span>
          </v-row>
          <v-row class="my-2" justify="center">
            <span class="text-body-2">{{ strings.webhookInfo.pendingUpdates(webhookInfo.pending_update_count) }}</span>
          </v-row>
          <v-row class="my-2" justify="center" v-if="webhookInfo?.last_error_message">
            <v-alert type="info" variant="tonal" closable density="compact" :text="webhookInfo.last_error_message">
              <template #title>
                <span class="text-body-1">
                  {{ strings.webhookInfo.lastErrorDate(toLocaleDateString(webhookInfo.last_error_date)) }}
                </span>
              </template>
              <div v-if="webhookInfo.last_synchronization_error_date">
                {{
                  strings.webhookInfo.lastSyncErrorDate(toLocaleDateString(webhookInfo.last_synchronization_error_date))
                }}
              </div>
            </v-alert>
          </v-row>
        </div>
        <div v-if="state === 'loading'">
          <v-row justify="center" class="mb-4">
            <v-progress-circular indeterminate></v-progress-circular>
          </v-row>
        </div>
        <div v-if="state === 'error'">
          <v-row class="mb-4" justify="center">
            <v-icon color="error" size="40" icon="mdi-alert-circle"></v-icon>
          </v-row>
          <v-row class="my-2" justify="center">
            <span class="text-error">{{ error.description || error.message }}</span>
          </v-row>
        </div>
        <v-row class="mt-4" justify="center">
          <v-btn @click="getWebhookInfo" variant="outlined" size="small">
            {{ strings.webhookInfo.buttons.refresh }}
          </v-btn>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>
<style scoped>
hr {
  margin-bottom: 0;
}
</style>