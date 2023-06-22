<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import HomeHeroInfo from "./HomeHeroInfo.vue";
import NotFound from './NotFound.vue';

const { Layout } = DefaultTheme
const { frontmatter: fm } = useData()
</script>

<template>
  <Layout>
    <template #home-hero-info>
      <HomeHeroInfo :name="fm.hero.name" :text="fm.hero.text" :tagline="fm.hero.tagline" />
    </template>
    <template #not-found>
      <NotFound />
    </template>
  </Layout>
</template>