<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import { useData } from 'vitepress'
import HomeHeroInfo from "./HomeHeroInfo.vue";
import NotFound from './NotFound.vue';
import { onMounted } from "vue";

const { Layout } = DefaultTheme as any;
const { frontmatter: fm } = useData()
const lottiePlayer = "https://unpkg.com/@lottiefiles/lottie-player@2.0.2/dist/tgs-player.js";

onMounted(() => {
  if (!import.meta.env.SSR) {
    if (document.readyState === "complete") loadLottiePlayer();
    else window.addEventListener("load", () => loadLottiePlayer());
  }
});

const loadLottiePlayer = (timeout = 3_000) => {
  window.lottiePromise = new Promise(resolve => {
    setTimeout(() => import(lottiePlayer).then(resolve), timeout);
  });
};
</script>

<template>
  <Layout>
    <template #home-hero-info>
      <HomeHeroInfo :name="fm.hero.name" :text="fm.hero.text" :taglines="fm.hero.taglines" />
    </template>
    <template #not-found>
      <NotFound />
    </template>
  </Layout>
</template>
