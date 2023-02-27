<script lang="ts" setup>
import { computed } from 'vue'
import { VCard, VCardText, VCardActions } from 'vuetify/components/VCard'
import { VTextField } from 'vuetify/components/VTextField'
import type { Translation } from './translations/types'
import { VForm } from 'vuetify/components/VForm'
import { VBtn } from 'vuetify/components/VBtn'
import { VSpacer } from 'vuetify/components/VGrid'
import { VSwitch } from 'vuetify/components/VSwitch'

const props = defineProps<{ strings: Translation }>()
const translation = computed(() => props.strings.manageWebhook)
</script>
<template>
  <v-card>
    <v-card-text>
      <v-form>
        <v-text-field class="mb-5" required :label="translation.fields.url.label"
          :hint="translation.fields.url.placeholder" persistent-hint />
        <v-text-field class="mb-5" clearable :label="translation.fields.secret.label"
          :hint="translation.fields.secret.placeholder" persistent-hint />
        <v-switch class="mt-0 mb-0 pt-0 pb-0" color="primary" hide-details
          :label="translation.fields.dropPending.label"></v-switch>
      </v-form>
    </v-card-text>
    <hr>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn size="small" color="error">{{ translation.buttons.deleteWebhook }}</v-btn>
      <v-btn size="small" color="primary">{{ translation.buttons.setWebhook }}</v-btn>
    </v-card-actions>
  </v-card>
</template>