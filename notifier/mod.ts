import * as path from "https://deno.land/std@0.140.0/path/mod.ts";

import { Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import { Bot } from "https://deno.land/x/grammy@v1.8.3/mod.ts";

import env from "./env.ts";
import * as db from "./db.ts";
import { verifyGitHubWebhook } from "./utils.ts";

const app = new Application();
const bot = new Bot(env.BOT_TOKEN);

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (_err) {
    ctx.response.status = 500;
  }
});

app.use(async (ctx, next) => {
  let verified = false;
  try {
    const result = await verifyGitHubWebhook(
      ctx.request.originalRequest,
    );
    verified = result.verified;
  } catch (_err) {
    //
  } finally {
    if (!verified) {
      ctx.response.redirect("https://grammy.dev");
    } else {
      await next();
    }
  }
});

const labels: Record<string, string> = JSON.parse(
  await Deno.readTextFile(
    path.join(
      path.dirname(path.fromFileUrl(import.meta.url)),
      "labels.json",
    ),
  ),
);
const labelsInverse = Object.fromEntries(
  Object.entries(labels).map(([k, v]) => [v, k]),
);
const labelNames = Object.keys(labelsInverse);

function getUpdatedText(text: string, currLabels: string[]) {
  const labelsInText = text.split("\n").slice(1).filter((v) => v).filter((v) =>
    v.startsWith("·")
  ).map((v) => v.split(/\s/)[1]);
  for (const label of labelsInText) {
    if (!currLabels.includes(labels[label])) {
      labelsInText.splice(labelsInText.indexOf(label), 1);
    }
  }
  for (const label of currLabels) {
    if (!labelsInText.includes(labelsInverse[label])) {
      labelsInText.push(labelsInverse[label]);
    }
  }
  return text.split("\n")[0] + "\n\n" +
    labelsInText.filter((v) => v).map((v) => `· ${v}`).join("\n");
}

const other = { parse_mode: "MarkdownV2" as const };

// deno-lint-ignore no-explicit-any
async function updateLabels(payload: any) {
  if (
    labelNames.includes(
      payload.label.name,
    )
  ) {
    const notification = await db.getNotification(
      payload.pull_request.number,
    );
    if (notification) {
      const updatedText = getUpdatedText(
        notification.text,
        // deno-lint-ignore no-explicit-any
        payload.pull_request.labels.map((v: any) => v.name),
      );
      if (updatedText != notification.text) {
        await bot.api.editMessageText(
          env.CHAT_ID,
          notification.message_id,
          updatedText,
          other,
        );
        await db.updateNotification(
          notification.message_id,
          updatedText,
        );
      }
    }
  }
}

app.use(async (ctx) => {
  let payload;
  try {
    payload = await ctx.request.body().value;
  } catch (_err) {
    return;
  }
  if (payload.repository.full_name == "grammyjs/website") {
    switch (payload.action) {
      case "labeled": {
        switch (payload.label.name) {
          case "ready for translation": {
            const text =
              `[\\#${payload.pull_request.number}](${payload.pull_request.html_url}) with ${payload.pull_request.additions} addition${
                payload.pull_request.additions != 1 ? "s" : ""
              } and ${payload.pull_request.deletions} deletion${
                payload.pull_request.deletions != 1 ? "s" : ""
              } is ready for translation\\.`;
            const notification = await db.getNotification(
              payload.pull_request.number,
            );
            if (notification) {
              await bot.api.editMessageText(
                env.CHAT_ID,
                notification.message_id,
                text,
                other,
              );
              await db.updateNotification(notification.message_id, text);
            } else {
              const notification = await bot.api.sendMessage(
                env.CHAT_ID,
                text,
                other,
              );
              await bot.api.pinChatMessage(
                env.CHAT_ID,
                notification.message_id,
              );
              await db.createNotification(
                payload.pull_request.number,
                notification.message_id,
                text,
              );
            }
            break;
          }
          default: {
            await updateLabels(payload);
          }
        }
        break;
      }
      case "unlabeled": {
        switch (payload.label.name) {
          case "ready for translation": {
            const notification = await db.getNotification(
              payload.pull_request.number,
            );
            if (notification) {
              await bot.api.editMessageText(
                env.CHAT_ID,
                notification.message_id,
                `~${notification.text}~`,
                other,
              );
            }
            break;
          }
          default: {
            await updateLabels(payload);
          }
        }
        break;
      }
      case "closed": {
        if (payload.pull_request) {
          const notification = await db.getNotification(
            payload.pull_request.number,
          );
          if (notification) {
            await bot.api.editMessageText(
              env.CHAT_ID,
              notification.message_id,
              `__${notification.text}__`,
              other,
            );
            await bot.api.unpinChatMessage(
              env.CHAT_ID,
              notification.message_id,
            );
            await db.deleteNotification(payload.pull_request.number);
          }
        }
        break;
      }
    }
  }
  ctx.response.status = 200;
});

await db.connectAndInitialize();
await app.listen({ port: 8000 });
