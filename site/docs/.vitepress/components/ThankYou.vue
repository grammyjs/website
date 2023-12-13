<script lang="ts" setup>
import { ref, onMounted } from "vue";

const props = defineProps<{ s: [string, string, string, string] }>();
const contributor = ref({
  login: "",
  href: "",
  name: "",
  photo: "",
  identicon: "",
  show: false,
});

/**
 * Returns a pseudo-random number between 0 and len which is seeded by the
 * current date.
 */
async function pseudoRandom255(len: number): Promise<number> {
  const enc = new TextEncoder();
  const today = new Date(2023, 12, 3);
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

async function loadContributorData() {
  let identiconUrl = '';
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
    typeof cachedContributor.photo === "string" &&
    typeof cachedContributor.identicon === "string" &&
    typeof cachedContributor.show === "boolean"
  ) {
    contributor.value.login = cachedContributor.login;
    contributor.value.href = cachedContributor.href;
    contributor.value.name = cachedContributor.name;
    contributor.value.photo = cachedContributor.photo;
    contributor.value.identicon = cachedContributor.identicon;
    contributor.value.show = cachedContributor.show;
    return;
  }

  try {
    const res = await fetch("https://raw.githubusercontent.com/grammyjs/grammY/main/.all-contributorsrc");

    if (!res.ok) { throw res }
    
    const { contributors } = await res.json();
    const selectToday = await pseudoRandom255(contributors.length);
    const contributor_ = contributors[selectToday];

    // https://avatars.githubusercontent.com/u/42873000?v=4
    const parts = contributor_.avatar_url.split('/');
    const userIdWithParams = parts[parts.length - 1]; // Get the last part
    const userId = userIdWithParams.split('?')[0]; // Extract ID before '?'

    try {
      // Fetch the latest details of the user account
      const res = await fetch(`https://api.github.com/user/${userId}`);
      if (!res.ok) { throw res }

      const { login, name, avatar_url, html_url } = await res.json();
      contributor.value.login = login;
      contributor.value.href = html_url;
      contributor.value.name = name;
      contributor.value.photo = avatar_url + "&size=64";
    } catch (error) {
      // Fallback. Use the old details.
      contributor.value.login = contributor_.login;
      contributor.value.href = `https://github.com/${contributor_.login}`;
      contributor.value.name = contributor_.name;
      contributor.value.photo = contributor_.avatar_url + "&size=64";
    }
    
    try {
      const res = await fetch(`https://identicons.github.com/${contributor.value.login}.png`);
      if (!res.ok) { throw res }
      contributor.value.identicon = `https://identicons.github.com/${contributor.value.login}.png`
    } catch (error) {
      // The GitHub account has been deleted. Generate the identicon from DiceBear API.
      contributor.value.identicon = `https://api.dicebear.com/7.x/identicon/png?seed=${contributor.value.login}&size=48&scale=80&backgroundColor=f0f0f0`
      
    }

    contributor.value.show = true;
    localStorage.setItem(
      "contributor",
      JSON.stringify({ ...contributor.value, day }),
    );
  }
  catch (error) {
    contributor.value.show = false
  }
}

onMounted(() => {
  loadContributorData();
});
</script>

<template>
  <div v-if="contributor.show" id="thankyou">
    <div id="avatar-container">
      <img
        id="identicon"
        v-bind:src="contributor.identicon"
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
    <img src="/images/Y.svg" alt="grammY logo" width="32" height="32" />
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
