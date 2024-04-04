<script setup lang="ts">
import { ref, onMounted } from "vue"
import { withBase, useData } from "vitepress"
import { useLangs } from "vitepress/dist/client/theme-default/composables/langs.js"

const { site, theme } = useData()
const { localeLinks } = useLangs({ removeCurrent: false })

const root = ref('/')
onMounted(() => {
  const path = window.location.pathname
    .replace(site.value.base, '')
    .replace(/(^.*?\/).*$/, '/$1')
  if (localeLinks.value.length) {
    root.value =
    localeLinks.value.find(({ link }) => link.startsWith(path))?.link ||
    localeLinks.value[0].link
  }
})
  
// Convert "\n" into the actual HTML new line
function splitNewLine(str: string): string[] {
  const parts = str.split(/(?<!\\)\n/g); // Matches "\n" that is not preceded by a backslash (\)
  return parts.map(part => part.replace(/\\n/g, '\\n')); // Replaces escaped "\n" with actual "\n"
}

// Pick a quote randomly
const randomIndex = Math.floor(Math.random() * theme.value.notFound?.messages.length);
const message = theme.value.notFound?.messages[randomIndex];
const msgParts = splitNewLine(message);
</script>

<template>
  <div class="NotFound">
    <p class="code">{{ theme.notFound?.code ?? '404' }}</p>
    <ClientOnly> 
      <h1 class="title">{{ theme.notFound?.title ?? 'PAGE NOT FOUND' }}</h1>
      <div class="divider" />
      <blockquote class="quote">
        <p v-for="msg in msgParts" :key="msg">{{ msg }}</p>
      </blockquote>

      <div class="action">
        <a
          class="link"
          :href="withBase(root)"
          :aria-label="theme.notFound?.linkLabel ?? 'go to home'"
        >
          {{ theme.notFound?.linkText ?? 'Take me home' }}
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
  /* max-width: 256px; */
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.action {
  padding-top: 20px;
}

.link {
  display: inline-block;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 16px;
  padding: 3px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  transition:
    border-color 0.25s,
    color 0.25s;
}

.link:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-2);
}
</style>
