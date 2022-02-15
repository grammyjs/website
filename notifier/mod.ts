import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";
import { verifyGitHubWebhook } from "./utils.ts";
import env from "./env.ts";

const bot = new Bot(env.BOT_TOKEN);
const app = new Application();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (_err) {
    ctx.response.status = 500;
  }
});

app.use(async (ctx, next) => {
  const { verified } = await verifyGitHubWebhook(
    ctx.request.originalRequest.request,
  );
  if (verified) {
    await next();
  }
});

app.use(async (ctx) => {
  let payload;
  try {
    payload = await ctx.request.body().value;
  } catch (_err) {
    return;
  }
  if (payload.repository.full_name == "grammyjs/website") {
    if (payload.action == "labeled") {
      if (payload.label.name == "ready for translation") {
        await bot.api.sendMessage(
          env.CHAT_ID,
          `[#${payload.pull_request.number}](${payload.pull_request.html_url}) is ready for translation.`,
          { parse_mode: "Markdown" },
        );
      }
    }
  }
  ctx.response.status = 200;
});

await app.listen({ port: 8000 });
