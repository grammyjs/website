<script lang="ts" setup>
import { UserFromGetMe } from '@grammyjs/types'
import { computed } from 'vue'
import { VBtn } from 'vuetify/components/VBtn'
import { VCard, VCardActions, VCardText, VCardTitle } from 'vuetify/components/VCard'
import { VCheckbox } from 'vuetify/components/VCheckbox'
import { VContainer, VRow, VSpacer } from 'vuetify/components/VGrid'
import ProfilePhoto from './ProfilePhoto.vue'
import TabsUi from './TabsUi.vue'
import { Translation } from './translations/types'

const props = defineProps<{ strings: Translation, info: UserFromGetMe, token: string }>()
const botName = computed(() => [ props.info.first_name, props.info.last_name ].filter(Boolean).join(' '))
const emit = defineEmits([ 'reset' ])
</script>

<template>
  <div class="info-ui">
    <v-card>
      <v-card-title>
        <v-container>
          <v-row align="center" dense>
            <profile-photo :token="token" />
            <div class="text-body-1 ml-3">{{ botName }}</div>
            <v-spacer />
            <span class="text-body-2">ID: {{ info.id }}</span>
          </v-row>
        </v-container>
      </v-card-title>
      <hr>
      <v-card-text class="pb-0">
        <v-container class="pt-0 pb-0">
          <v-row align-content="center">
            <v-checkbox readonly color="primary" :model-value="info.can_join_groups"
              :label="strings.botCard.canJoinGroups"></v-checkbox>
            <v-checkbox readonly color="primary" :model-value="info.can_read_all_group_messages"
              :label="strings.botCard.canReadGroupMessages"></v-checkbox>
            <v-checkbox readonly color="primary" :model-value="info.supports_inline_queries"
              :label="strings.botCard.inlineQueries"></v-checkbox>
          </v-row>
        </v-container>
        <tabs-ui :strings="strings" :token="token" />
      </v-card-text>
      <hr class="mt-5">
      <v-card-actions class="pt-0">
        <v-container class="py-0">
          <v-btn size="small" prepend-icon="mdi-arrow-left" @click="emit('reset')">{{ strings.botCard.buttons.changeToken
          }}</v-btn>
        </v-container>
      </v-card-actions>
    </v-card>
  </div>
</template>