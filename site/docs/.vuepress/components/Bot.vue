<template>
  <div>
    <button v-on:click="start()">Start!</button>
    <button v-on:click="stop()">Stop!</button>
    {{ isRunning ? "Bot is running" : "Bot is stopped" }}
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { Bot, Context } from "./grammy-bundle";

let bot: Bot | undefined;

const isRunning = ref(false);

function start() {
  bot = new Bot("");

  bot.on("message", (ctx: Context) => ctx.reply("Yep."));

  isRunning.value = true;
  bot.start();
}

async function stop() {
  isRunning.value = false;
  await bot?.stop();
  bot = undefined;
}

export default {
  async beforeUnmount() {
    await stop();
  },
  setup() {
    return {
      start,
      stop,
      isRunning,
    };
  },
};
</script>
