<script lang="ts" setup>
import { reactive, defineProps } from "vue";

const props = defineProps<{ s: [string, string, string] }>();
const contributor = reactive<Record<string, string>>({
  name: "",
  photo: "",
  href: "",
});

/**
 * Returns a pseudo-random number between 0 and len which is seeded by the
 * current date.
 */
async function pseudoRandom255(len: number): Promise<number> {
  const enc = new TextEncoder();
  const today = new Date();
  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode("grammy.dev"),
    { name: "HMAC", hash: { name: "SHA-512" } },
    false,
    ["sign"]
  );
  const signature = await window.crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(today.toDateString())
  );
  const arr = new Uint8Array(signature);
  const res = arr.reduce((x, y) => x ^ y);
  return Math.floor((res * len) / 255);
}

function getDay() {
  return Math.floor(Date.now() / 86400);
}
async function load() {
  const day = getDay();
  let cachedContributor: Record<string, string | number> = {};

  const item = localStorage.getItem("contributor");
  if (item) {
    try {
      cachedContributor = JSON.parse(item);
    } catch (_err) {
      // no parse, ignore
    }
  }

  if (
    typeof cachedContributor.day === "number" &&
    cachedContributor.day == day &&
    typeof cachedContributor.name === "string" &&
    typeof cachedContributor.photo === "string" &&
    typeof cachedContributor.href === "string"
  ) {
    contributor.name = cachedContributor.name;
    contributor.photo = cachedContributor.photo;
    contributor.href = cachedContributor.href;
    return;
  }

  const res = await fetch(
    "https://raw.githubusercontent.com/grammyjs/grammY/main/.all-contributorsrc"
  );
  if (res.status == 200) {
    const { contributors } = await res.json();
    const selectToday = await pseudoRandom255(contributors.length);
    const contributor_ = contributors[selectToday];

    contributor.name = contributor_.name;
    contributor.photo = contributor_.avatar_url;
    contributor.href = `https://github.com/${contributor_.login}`;
    localStorage.setItem(
      "contributor",
      JSON.stringify({ ...contributor, day })
    );
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
      {{ props.s[0] }}<span>{{ contributor.name }}</span
      >{{ props.s[1] }}
    </p>
  </a>
</template>

<style scoped>
a {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.33rem;
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
