<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  name: String,
  text: String,
  taglines: Array<string>
});

const showContent = ref(false);
const tagline = ref('');

watch(props, (newProps) => {
  pickTagline(newProps.taglines);
})

onMounted(() => {
  pickTagline(props.taglines);
  showContent.value = true;
});

function pickTagline(newTaglines: string[] | undefined) {
  if (newTaglines !== undefined && newTaglines.length > 0) {
    const randomIndex = Math.floor(Math.random() * newTaglines.length);

    tagline.value = newTaglines[randomIndex];
  }
}
</script>

<template>
  <h1 v-if="name" class="name">
    <span class="clip">{{ name }}</span>
  </h1>
  <p v-if="text" class="text">{{ text }}</p>
  <p class="tagline">…
    <span v-if="showContent" :key="tagline" class="tagline"> {{ tagline }}</span>
  </p>
</template>

<style scoped>
.name,
.text {
  max-width: 392px;
  letter-spacing: -0.4px;
  line-height: 40px;
  font-size: 32px;
  font-weight: 700;
  white-space: pre-wrap;
}

.VPHero.has-image .name,
.VPHero.has-image .text {
  margin: 0 auto;
}

.name {
  color: var(--vp-home-hero-name-color);
}

@media (min-width: 640px) {
  .name,
  .text {
    max-width: 576px;
    line-height: 56px;
    font-size: 48px;
  }
}

@media (min-width: 960px) {
  .name,
  .text {
    line-height: 64px;
    font-size: 56px;
  }

  .VPHero.has-image .name,
  .VPHero.has-image .text {
    margin: 0;
  }
}

.tagline {
  padding-top: 8px;
  max-width: 392px;
  line-height: 28px;
  font-size: 18px;
  font-weight: 500;
  font-style: italic;
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
}

.VPHero.has-image .tagline {
  margin: 0 auto;
}

@media (min-width: 640px) {
  .tagline {
    padding-top: 12px;
    max-width: 576px;
    line-height: 32px;
    font-size: 20px;
  }
}

@media (min-width: 960px) {
  .tagline {
    line-height: 36px;
    font-size: 24px;
  }

  .VPHero.has-image .tagline {
    margin: 0;
  }
}
</style>
