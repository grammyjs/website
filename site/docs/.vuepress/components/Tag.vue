<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

const items = computed(() => {
  return props.type.split(" ").map(value => {
    return {src: `/badges/${value}.svg`, alt: value};
  });
})
</script>

<template>
  <p>
    <div v-for="item in items" class="tag">
      <img :src="item.src" :alt="item.alt"/>
    </div>
  </p>
</template>

<style scoped>
.tag {
  margin-right: 0.5rem;
  display: inline;
}
</style>