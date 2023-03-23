<script lang="ts" setup>
import { reactive, computed } from "vue";

const languages = {
  es: "Spanish",
  id: "Indonesian",
  zh: "Chinese",
};

const popup = reactive({
  enabled: localStorage.getItem("disable_language_bar") == null,
});

const availableLanguage = navigator.languages.find((l) => l in languages);

const language = computed<string | null>(() =>
  popup.enabled && availableLanguage !== undefined
    ? languages[availableLanguage]
    : null
);

function disable() {
  popup.enabled = false;
  localStorage.setItem("disable_language_bar", "");
}
</script>

<template>
  <div v-if="language" class="container">
    <div class="bar">
      <div class="content">
        <a v-bind:href="`/${availableLanguage}`"
          >The documentation is available in {{ language }}.</a
        >
        <button @click="disable">
          <svg viewBox="0 0 10 10" height="11" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M.11.11a.375.375 0 0 1 .53 0l4.235 4.235L9.11.11a.375.375 0 0 1 .53.53L5.405 4.875 9.64 9.11a.375.375 0 0 1-.53.53L4.875 5.405.64 9.64a.375.375 0 0 1-.53-.53l4.235-4.235L.11.64a.375.375 0 0 1 0-.53Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.container {
  position: fixed;
  top: 60px;
  right: 0;
  z-index: 999;
  width: 100%;
  display: flex;
}

.bar {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0.5rem;
  text-align: center;
}

.content {
  height: 100%;
  padding: 10px;
  border-radius: 4px;
  background-color: var(--c-bg-light-translucent);
  display: inline-flex;
  gap: 0.5rem;
  justify-content: space-between;
}

button {
  padding: 0;
  margin: 0;
  padding: 1px;
  border: none;
  cursor: pointer;
  border-radius: 100%;
  justify-content: center;
  background-color: transparent;
}

button:hover {
  opacity: 0.75;
}
</style>
