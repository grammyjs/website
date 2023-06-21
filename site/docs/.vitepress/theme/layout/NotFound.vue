<script setup lang="ts">
import { ref } from 'vue'
import { withBase, useData } from 'vitepress'
import { notFound } from '../../configs/main'

function split(str: string): string[] {
  const parts = str.split(/(?<!\\)\n/g); // Matches "\n" that is not preceded by a backslash (\)
  return parts.map(part => part.replace(/\\n/g, '\\n')); // Replaces escaped "\n" with actual "\n"
}

const fallback = {
  title: "PAGE NOT FOUND",
  backToHome: "Take me hoooooooome",
  ariaLabel: "Go to home",
  messages: [
    "Not Found",
    "Nope.",
    "nothin' here for ya, sorry",
    "Error 404 \nThis Page Could Not Be Found But \nA Haiku Instead",
    "Country rooooaaaads,",
  ],
}

const { site } = useData();
const root = ref('/');
const config = ref(fallback);
const msgParts = ref(fallback.messages);

const path = window.location.pathname
  .replace(site.value.base, '')
  .replace(/(^.*?\/).*$/, '/$1');

  if (notFound[path]) {
    config.value = notFound[path];
    root.value = path
  } else {
    config.value = notFound['/']
  }

  const randomIndex = Math.floor(Math.random() * config.value.messages.length)
  const message = config.value.messages[randomIndex];
  msgParts.value = split(message);
</script>

<template>
  <div class="NotFound">
    <p class="code">404</p>
    <h1 class="title">{{ config.title }}</h1>
    <div class="divider" />
    <blockquote class="quote">
      <p v-for="msg in msgParts" :key="msg">{{ msg }}</p>
    </blockquote>
    <div class="action">
      <a class="link" :href="withBase(root)" :aria-label="config.ariaLabel">
        {{ config.backToHome }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.NotFound {
  padding: 64px 24px 96px;
  text-align: center;
}

@media (min-width: 768px) {
  .NotFound {
    padding: 96px 32px 168px;
  }
}

.code {
  line-height: 64px;
  font-size: 64px;
  font-weight: 600;
}

.title {
  padding-top: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  font-size: 20px;
  font-weight: 700;
}

.divider {
  margin: 24px auto 18px;
  width: 64px;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.quote {
  margin: 0 auto;
  max-width: 256px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.action {
  padding-top: 20px;
}

.link {
  display: inline-block;
  border: 1px solid var(--vp-c-brand);
  border-radius: 16px;
  padding: 3px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand);
  transition: border-color 0.25s, color 0.25s;
}

.link:hover {
  border-color: var(--vp-c-brand-dark);
  color: var(--vp-c-brand-dark);
}
</style>