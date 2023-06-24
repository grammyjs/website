<script setup lang="ts">
import { onBeforeMount, ref } from "vue";

defineProps<{
  name?: string
  text?: string
  taglines?: string[]
}>();

const showContent = ref(false);

onBeforeMount(() => {
  showContent.value = true;
});

</script>

<template>
  <h1 v-if="name" class="name">
    <span class="clip">{{ name }}</span>
  </h1>
  <p v-if="text" class="text">{{ text }}</p>
  <div v-if="showContent">
    <p v-if="taglines" class="tagline">… {{ taglines[Math.floor(Math.random() * taglines.length)] }}</p>
  </div>
  <div v-else>
    <p class="tagline">…</p>
  </div>
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
