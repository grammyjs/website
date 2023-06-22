<script lang="ts" setup>
import { reactive } from "vue";

const props = defineProps<{ s: [string, string, string, string] }>();
const contributor = reactive<Record<string, string>>({
  login: "",
  href: "",
  name: "",
  photo: "",
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
    typeof cachedContributor.login === "string" &&
    typeof cachedContributor.href === "string" &&
    typeof cachedContributor.name === "string" &&
    typeof cachedContributor.photo === "string"
  ) {
    contributor.login = cachedContributor.login;
    contributor.href = cachedContributor.href;
    contributor.name = cachedContributor.name;
    contributor.photo = cachedContributor.photo;
    return;
  }

  const res = await fetch(
    "https://raw.githubusercontent.com/grammyjs/grammY/main/.all-contributorsrc"
  );
  if (res.status == 200) {
    const { contributors } = await res.json();
    const selectToday = await pseudoRandom255(contributors.length);
    const contributor_ = contributors[selectToday];

    contributor.login = contributor_.login;
    contributor.href = `https://github.com/${contributor_.login}`;
    contributor.name = contributor_.name;
    contributor.photo = contributor_.avatar_url + '&size=64';
    localStorage.setItem(
      "contributor",
      JSON.stringify({ ...contributor, day })
    );
  }
}

load();
</script>

<template>
  <a v-if="contributor.name" v-bind:href="contributor.href" target="_blank" rel="noreferrer noopener">
    <img v-bind:alt="contributor.login" v-bind:src="contributor.photo" />
    <p>
      {{ props.s[0] }}<span>{{ contributor.name }}</span>{{ contributor.name.toLowerCase() == "knorpelsenf" ? (props.s[3]
        ?? props.s[2]) : props.s[2] }}
    </p>
  </a>
  <div v-else id="footer-logo">
    <img src="/images/Y.webp" alt="grammY logo"/>
  </div>
</template>

<style scoped lang="scss">
a {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
  cursor: pointer;
  color: var(--vp-c-text-1);
  
  > img {
    height: 2rem;
    border-radius: 9999px;
  }
  
  > p {
    font-size: 0.85rem;
    margin: 0px;

    span {
      color: var(--vp-c-brand);
      font-weight: bold;
    }
  }

  &:hover {
    text-decoration: none;

    > p > span {
      text-decoration: underline;
    }
  }
}

#footer-logo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: 2rem;
    border-radius: 9999px;
  }
}
</style>
