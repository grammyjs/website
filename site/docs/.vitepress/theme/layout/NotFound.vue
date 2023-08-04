<script setup lang="ts">
import { ref } from 'vue'
import { withBase, useRoute } from 'vitepress'
import { notFound } from '../../configs/locales/main'

function splitNewLine(str: string): string[] {
  const parts = str.split(/(?<!\\)\n/g); // Matches "\n" that is not preceded by a backslash (\)
  return parts.map(part => part.replace(/\\n/g, '\\n')); // Replaces escaped "\n" with actual "\n"
}

const fullPath = useRoute().path;
const paths = fullPath.split('/');
const firstPath = paths[1];
const lang = (firstPath && paths.pop() !== firstPath) ? firstPath : 'root';

const root = ref(lang);
const config = ref(notFound[lang]);
const msgParts = ref(config.value?.messages);

if (config.value) {
  config.value = notFound[lang];
  root.value = lang;
} else {
  config.value = notFound['root'];
}

const randomIndex = Math.floor(Math.random() * config.value.messages.length);
const message = config.value.messages[randomIndex];
msgParts.value = splitNewLine(message);

</script>

<template>
  <div class="NotFound">
    <p class="code">404</p>
    <ClientOnly> 
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
    </ClientOnly>
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