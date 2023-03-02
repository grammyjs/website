<script lang="ts" setup>
import { onMounted } from 'vue'
import { VAvatar } from 'vuetify/components/VAvatar'
import { useProfilePhoto } from '../../composables/use-profile-photo'
import { VProgressCircular } from 'vuetify/components/VProgressCircular'

const props = defineProps<{ token: string }>()
const { refresh, state, url } = useProfilePhoto(props.token)
onMounted(() => refresh())
</script>
<template>
  <div v-if="state === 'done'">
    <v-avatar :image="url" />
  </div>
  <div v-if="state === 'error'">
    <v-avatar color="error" icon="mdi-alert-circle" />
  </div>
  <div v-if="state === 'loading'">
    <v-avatar color="primary">
      <v-progress-circular :width="2" :size="28" indeterminate></v-progress-circular>
    </v-avatar>
  </div>
  <div v-if="state === 'empty'">
    <v-avatar color="primary" icon="mdi-robot" />
  </div>
</template>