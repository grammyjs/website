<script lang="ts" setup>
import { reactive } from "vue";

const contributor = reactive<Record<string, string>>({
  name: "",
  photo: "",
  href: "",
});

async function load() {
  const res = await fetch(
    "https://raw.githubusercontent.com/grammyjs/grammY/main/.all-contributorsrc"
  );
  if (res.status == 200) {
    const { contributors } = await res.json();
    const contributor_ =
      contributors[Math.floor((Date.now() / 86400) % contributors.length)];

    contributor.name = contributor_.name;
    contributor.photo = contributor_.avatar_url;
    contributor.href = `https://github.com/${contributor_.login}`;
  }
}

load();
</script>

<template>
  <a
    v-if="contributor.name"
    v-bind:href="contributor.href"
    target="_blank"
    rel="noreferrer noopener"
  >
    <img v-bind:src="contributor.photo" />
    <p>
      Thank you <span>{{ contributor.name }}</span> for being a contributor to
      grammY.
    </p>
  </a>
</template>

<style scoped>
a {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  color: var(--c-text);
}

a > p {
  font-size: 0.85rem;
}

a > p > span {
  color: var(--c-brand);
  font-weight: bold;
}

a:hover {
  text-decoration: none;
}

a:hover > p > span {
  text-decoration: underline;
}

a > img {
  height: 2rem;
  border-radius: 9999px;
}
</style>
