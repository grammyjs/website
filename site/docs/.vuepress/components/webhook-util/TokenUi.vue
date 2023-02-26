<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import { VAlert } from 'vuetify/components/VAlert'
import { VBtn } from 'vuetify/components/VBtn'
import { VCard, VCardActions, VCardText } from 'vuetify/components/VCard'
import { VSpacer } from 'vuetify/components/VGrid'
import { VTextField } from 'vuetify/components/VTextField'
import type { Translation } from './translations/types'

const props = defineProps<{ strings: Translation }>()
const translation = computed(() => props.strings.tokenCard)
</script>
<template>
  <div class="token-ui">
    <v-alert type="warning" :text="translation.disclaimer.content"
      :title="translation.disclaimer.title">
    </v-alert>
    <v-card>
      <v-card-text>
        <v-text-field persistent-hint :hint="translation.fields.token.placeholder" :label="translation.fields.token.label" />  
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="flat" size="small">{{ translation.buttons.loadBotInfo }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.token-ui > .v-alert {
  margin-bottom: 15px;
}
</style>