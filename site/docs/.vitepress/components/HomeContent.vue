<script setup lang="ts">
import { useData } from "vitepress";
const { theme } = useData();
</script>

<template>
  <div
    class="vp-doc container"
    :class="theme.externalLinkIcon && 'external-link-icon-enabled'"
    id="home-content"
  >
    <slot />
  </div>
</template>

<style>
#home-content.container {
  margin: auto;
  width: 100%;
  max-width: 1280px;
  padding: 0 24px;
}

@media (min-width: 640px) {
  #home-content.container {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  #home-content.container {
    width: 100%;
    padding: 0 64px;
  }
}
</style>
