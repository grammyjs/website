<script lang="ts" setup>
import { VAvatar } from 'vuetify/components/VAvatar'
import { VCard, VCardText, VCardTitle, VCardActions } from 'vuetify/components/VCard'
import { VContainer, VRow, VSpacer } from 'vuetify/components/VGrid'
import { Translation } from './translations/types'
import { VCheckbox } from 'vuetify/components/VCheckbox'
import { VBtn } from 'vuetify/components/VBtn'
import TabsUi from './TabsUi.vue'

const props = defineProps<{ strings: Translation }>()
// const translation = computed(() => props.strings.botCard)
</script>

<template>
  <div class="info-ui">
    <v-card>
      <v-card-title>
        <v-container>
          <v-row align="center" dense>
            <!-- TODO: Replace with bot picture -->
            <v-avatar color="primary" icon="mdi-vuetify" />
            <!-- TODO: Remove placeholder -->
            <div class="text-body-1 ml-3">Rmunhoz Bot</div>
            <v-spacer />
            <!-- TODO: Remove placeholder -->
            <span class="text-body-2">ID: 4613991</span>
          </v-row>
        </v-container>
        <hr>
      </v-card-title>
      <v-card-text class="pb-0">
        <v-container class="pt-0 pb-0">
          <v-row align-content="center">
            <!-- TODO: Add dynamic values -->
            <v-checkbox color="primary" :label="strings.botCard.canJoinGroups"></v-checkbox>
            <v-checkbox color="primary" :label="strings.botCard.canReadGroupMessages"></v-checkbox>
            <v-checkbox color="primary" :label="strings.botCard.inlineQueries"></v-checkbox>
          </v-row>
        </v-container>
        <tabs-ui :strings="strings" />
        <hr>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-container class="py-0">
          <v-btn size="small" prepend-icon="mdi-arrow-left">{{ strings.botCard.buttons.changeToken }}</v-btn>
        </v-container>
      </v-card-actions>
    </v-card>
  </div>
</template>