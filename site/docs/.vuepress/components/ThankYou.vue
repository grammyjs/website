<script lang="ts" setup>
import { reactive } from "vue";

const contributor = reactive<Record<string, string>>({
  name: "",
  photo: "",
  href: "",
});

function getDay() {
  return Math.floor(Date.now() / 86400);
}
async function load() {
  let cachedContributor: Record<string, string | number> = {};

  try {
    cachedContributor = JSON.parse(localStorage.getItem("contributor") ?? "{}");
  } catch (_err) {
    //
  }

  if (
    typeof cachedContributor.day === "number" &&
    cachedContributor.day == getDay() &&
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
    const contributor_ = contributors[getDay() % contributors.length];

    contributor.name = contributor_.name;
    contributor.photo = contributor_.avatar_url;
    contributor.href = `https://github.com/${contributor_.login}`;
    localStorage.setItem(
      "contributor",
      JSON.stringify({ ...contributor, day: getDay() })
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
