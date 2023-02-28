<script lang="ts" setup>
import { UserFromGetMe } from '@grammyjs/types'
import { computed, ref } from 'vue'
import { VAlert } from 'vuetify/components/VAlert'
import { VBtn } from 'vuetify/components/VBtn'
import { VCard, VCardActions, VCardText } from 'vuetify/components/VCard'
import { VSpacer } from 'vuetify/components/VGrid'
import { VTextField } from 'vuetify/components/VTextField'
import { useTelegramApi } from 'grammy-vue'
import type { Translation } from './translations/types'

const props = defineProps<{ strings: Translation }>()
const translation = computed(() => props.strings.tokenCard)
const token = ref('')

const { useApiMethod } = useTelegramApi(token)
const { refresh: getMe, state, data: botInfo, error } = useApiMethod('getMe')

const emit = defineEmits<{ (event: 'info', botInfo: UserFromGetMe, token: string) }>()

const loadBotInfo = async () => {
  await getMe()
  emit('info', botInfo.value, token.value)
}
</script>
<template>
  <div class="token-ui">
    <v-alert :type="state === 'error' ? 'error' : 'warning'"
      :text="state !== 'error' ? translation.disclaimer.content : error.description ?? error.message"
      :title="state !== 'error' ? translation.disclaimer.title : undefined">
    </v-alert>
    <v-card>
      <v-card-text>
        <v-text-field :disabled="state === 'loading'" v-model="token" persistent-hint
          :hint="translation.fields.token.placeholder" :label="translation.fields.token.label" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :loading="state === 'loading'" color="primary" variant="flat" size="small" @click="loadBotInfo">
          {{ translation.buttons.loadBotInfo }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.token-ui>.v-alert {
  margin-bottom: 15px;
}
</style>