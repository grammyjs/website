<script lang="ts" setup>
import { ref, computed, toRefs } from 'vue'
import { VCard, VCardText, VCardActions } from 'vuetify/components/VCard'
import { VTextField } from 'vuetify/components/VTextField'
import type { Translation } from './translations/types'
import { VForm } from 'vuetify/components/VForm'
import { VBtn } from 'vuetify/components/VBtn'
import { VSpacer } from 'vuetify/components/VGrid'
import { VSwitch } from 'vuetify/components/VSwitch'
import { VAlert } from 'vuetify/components/VAlert'

import { useTelegramApi } from 'grammy-vue'

const props = defineProps<{ strings: Translation, token: string }>()
const { token } = toRefs(props)
const translation = computed(() => props.strings.manageWebhook)

const { useApiMethod } = useTelegramApi(token)
const { state: setWebhookState, refresh: setWebhook, error: setWebhookError } = useApiMethod('setWebhook', 1000)
const { state: deleteWebhookState, refresh: deleteWebhook, error: deleteWebhookError } = useApiMethod('deleteWebhook', 1000)

const urlField = ref()
const url = ref('')
const secret = ref('')
const dropPendingUpdates = ref(false)

const emit = defineEmits([ 'rerfesh' ])

async function callSetWebhook () {
  const validationResult = await urlField.value.validate()
  if (validationResult.length > 0) return
  await setWebhook(url.value, { secret_token: secret.value || undefined, drop_pending_updates: dropPendingUpdates.value })
  emit('rerfesh')
}

async function callDeleteWebhook () {
  await deleteWebhook({ drop_pending_updates: dropPendingUpdates.value })
  urlField.value.reset()
  emit('rerfesh')
}

const globalLoading = computed(() => setWebhookState.value === 'loading' || deleteWebhookState.value === 'loading')
const error = computed(() => setWebhookError.value || deleteWebhookError.value)

const urlRules = [
  (value: any) => !!value || translation.value.fields.url.errorMessages.required,
  (value: string) => {
    try {
      const urlObj = new URL(value)
      if (urlObj.protocol.replace(':', '') !== 'https') return translation.value.fields.url.errorMessages.protocol
      return true
    } catch (err) {
      return translation.value.fields.url.errorMessages.invalid
    }
  }
]
</script>
<template>
  <v-card :disabled="globalLoading">
    <v-alert v-if="error" type="error" :text="error.description || error.message"></v-alert>
    <v-card-text>
      <v-form>
        <v-text-field ref="urlField" :rules="urlRules" v-model="url" class="mb-5" required
          :label="translation.fields.url.label" :hint="translation.fields.url.placeholder" persistent-hint />
        <v-text-field v-model="secret" class="mb-5" clearable :label="translation.fields.secret.label"
          :hint="translation.fields.secret.placeholder" persistent-hint />
        <v-switch v-model="dropPendingUpdates" class="mt-0 mb-0 pt-0 pb-0" color="primary" hide-details
          :label="translation.fields.dropPending.label"></v-switch>
      </v-form>
    </v-card-text>
    <hr>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn size="small" color="error" :loading="setWebhookState === 'loading'" @click="callDeleteWebhook">
        {{ translation.buttons.deleteWebhook }}
      </v-btn>
      <v-btn size="small" color="primary" :loading="deleteWebhookState === 'loading'" @click="callSetWebhook">
        {{ translation.buttons.setWebhook }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>