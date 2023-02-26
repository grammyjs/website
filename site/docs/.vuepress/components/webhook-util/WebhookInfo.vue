<script lang="ts" setup>
import { VCard, VCardText } from 'vuetify/components/VCard'
import { VContainer, VRow } from 'vuetify/components/VGrid'
import { VIcon } from 'vuetify/components/VIcon'
import { VBtn } from 'vuetify/components/VBtn'
import { Translation } from './translations/types'
import { computed, ref } from 'vue'

const props = defineProps<{ strings: Translation }>()
const hasWebhook = ref(true)
const toggleHasWebhook = () => { hasWebhook.value = !hasWebhook.value }
const icon = computed(() => hasWebhook.value ? 'mdi-web-check' : 'mdi-web-off')
const url = computed(() => hasWebhook.value ? 'https://some.domain.com/webhook' : 'No webhook set')
</script>
<template>
  <v-card>
    <v-card-text>
      <v-container>
        <v-row class="mb-4" justify="center">
          <v-icon color="grey-darken-1" size="40" :icon="icon"></v-icon>
        </v-row>
        <v-row class="my-2" justify="center">
          <!-- TODO: Replace with webhook URL -->
          <span class="text-body-2 text-grey-darken-1">{{ url }}</span>
        </v-row>
        <v-row class="my-2" justify="center" v-if="hasWebhook">
          <span class="text-body-2">{{ strings.webhookInfo.pendingUpdates(1) }}</span>
        </v-row>
        <v-row class="mt-4" justify="center">
          <v-btn @click="toggleHasWebhook" variant="outlined" size="small">
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