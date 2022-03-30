import { Application } from "https://deno.land/x/oak@v10.2.1/mod.ts";
import { Bot } from "https://deno.land/x/grammy@v1.7.1/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";

import env from "./env.ts";
import { verifyGitHubWebhook } from "./utils.ts";

const app = new Application();
const bot = new Bot(env.BOT_TOKEN);
const client = new Client(env.DATABASE_URI);

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
    const other = { parse_mode: "MarkdownV2" as const };
    if (payload.label?.name == "ready for translation") {
      switch (payload.action) {
        case "labeled": {
          const text =
            `[\\#${payload.pull_request.number}](${payload.pull_request.html_url}) with ${payload.pull_request.additions} addition${
              payload.pull_request.additions != 1 ? "s" : ""
            } and ${payload.pull_request.deletions} deletion${
              payload.pull_request.deletions != 1 ? "s" : ""
            } is ready for translation\\.`;
          const messageId = Number(
            (await client.queryArray
              `SELECT message_id FROM notifications WHERE pr_number=${payload.pull_request.number};`)
              .rows[0]?.[0],
          );
          if (!isNaN(messageId)) {
            await bot.api.editMessageText(
              env.CHAT_ID,
              messageId,
              text,
              other,
            );
            await client.queryArray
              `UPDATE notifications SET text=${text} WHERE message_id=${messageId};`;
          } else {
            const notification = await bot.api.sendMessage(
              env.CHAT_ID,
              text,
              other,
            );
            await client.queryArray
              `INSERT INTO notifications values (${payload.pull_request.number}, ${notification.message_id}, ${text});`;
          }

          break;
        }
        case "unlabeled": {
          const [messageId, text] =
            ((await client.queryArray
              `SELECT message_id, text FROM notifications WHERE pr_number=${payload.pull_request.number};`)
              .rows[0] || []) as [number, string];
          if (messageId) {
            await bot.api.editMessageText(
              env.CHAT_ID,
              messageId,
              `~${text}~`,
              other,
            );
          }
          break;
        }
      }
    }
    if (payload.action == "closed" && payload.pull_request) {
      const messageId = Number(
        (await client.queryArray
          `SELECT message_id FROM notifications WHERE pr_number=${payload.pull_request.number};`)
          .rows[0]?.[0],
      );
      if (!isNaN(messageId)) {
        await bot.api.deleteMessage(env.CHAT_ID, messageId);
        await client.queryArray
          `DELETE FROM notifications WHERE pr_number=${payload.pull_request.number};`;
      }
    }
  }
  ctx.response.status = 200;
});

await client.connect();
await client.queryArray(
  "CREATE TABLE IF NOT EXISTS notifications (pr_number int PRIMARY_KEY, message_id int, text varchar);",
);
await app.listen({ port: 8000 });
