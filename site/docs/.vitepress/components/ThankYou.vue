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
    ["sign"],
  );
  const signature = await window.crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(today.toDateString()),
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
    "https://raw.githubusercontent.com/grammyjs/grammY/main/.all-contributorsrc",
  );
  if (res.status == 200) {
    const { contributors } = await res.json();
    const selectToday = await pseudoRandom255(contributors.length);
    const contributor_ = contributors[selectToday];

    contributor.login = contributor_.login;
    contributor.href = `https://github.com/${contributor_.login}`;
    contributor.name = contributor_.name;
    contributor.photo = contributor_.avatar_url + "&size=64";
    localStorage.setItem(
      "contributor",
      JSON.stringify({ ...contributor, day }),
    );
  }
}

load();
</script>

<template>
  <div v-if="contributor.name" id="thankyou">
    <div id="avatar-container">
      <img
        id="identicon"
        v-bind:src="
          'https://identicons.github.com/' + contributor.login + '.png'
        "
        alt="contributor's identicon"
        width="32"
        height="32"
      />
      <img
        id="github-avatar"
        v-bind:alt="contributor.login"
        v-bind:src="contributor.photo"
        width="32"
        height="32"
      />
    </div>
    <p>
      {{ props.s[0] }}
      <a
        v-bind:href="contributor.href"
        target="_blank"
        rel="noreferrer noopener"
        >{{ contributor.name }}</a
      >{{
        contributor.name.toLowerCase() == "knorpelsenf"
          ? props.s[3] ?? props.s[2]
          : props.s[2]
      }}
    </p>
  </div>
  <div v-else id="thankyou">
    <img src="/images/Y.webp" alt="grammY logo" width="32" height="32" />
  </div>
</template>

<style lang="scss">
#thankyou {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
  img {
    height: 2rem;
    width: 2rem;
    max-width: none;
    border-radius: 9999px;
  }
  p {
    margin: 0;
    font-size: 0.85rem;
    font-weight: bold;
    a {
      font-weight: bold;
    }
  }
}

#avatar-container,
#identicon {
  position: relative;
}

#github-avatar {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
