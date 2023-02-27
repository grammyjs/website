<script lang="ts" setup>
import { VTabs, VTab } from 'vuetify/components/VTabs'
import { Translation } from './translations/types'
import { VWindow, VWindowItem } from 'vuetify/components/VWindow'
import { VCard } from 'vuetify/components/VCard'
import { ref, computed } from 'vue'
import WebhookInfo from './WebhookInfo.vue'
import ManageWebhook from './ManageWebhook.vue'

const props = defineProps<{ strings: Translation }>()
const translation = computed(() => props.strings.botCard.tabs)

const tab = ref('tab-1')
</script>
<template>
  <div class="tabs-ui">
    <v-card variant="outlined">
      <v-tabs grow color="primary" v-model="tab">
        <v-tab>
          {{ translation.webhookInfo }}
        </v-tab>
        <v-tab>
          {{ translation.manageWebhook }}
        </v-tab>
      </v-tabs>
      <v-window v-model="tab">
        <v-window-item :value="0">
          <webhook-info :strings="strings" />
        </v-window-item>
        <v-window-item :value="1">
          <manage-webhook :strings="strings" />
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>