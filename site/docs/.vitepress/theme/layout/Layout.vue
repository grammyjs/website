<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import { useData } from 'vitepress'
import HomeHeroInfo from "./HomeHeroInfo.vue";
import NotFound from './NotFound.vue';

const { Layout } = DefaultTheme as any;
const { frontmatter: fm } = useData()
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