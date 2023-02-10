import * as path from "std/path/mod.ts";
import { Application, Router } from "oak/mod.ts";
import { Bot, type Context, webhookCallback } from "grammy/mod.ts";
import { type FileFlavor, hydrateFiles } from "grammy_files/mod.ts";
import env from "./env.ts";
import * as db from "./db.ts";
import { verifyGitHubWebhook } from "./utils.ts";

const app = new Application();
const router = new Router();
const bot = new Bot<FileFlavor<Context>>(env.BOT_TOKEN);

bot.api.config.use(hydrateFiles(bot.token));

bot.chatType(["group", "supergroup"]).filter((ctx) =>
  ctx.chat.id == env.CHAT_ID
).on("message:document", async (ctx) => {
  if (!ctx.message.document.file_name?.endsWith(".patch")) {
    return;
  }
  const repliedMessage = ctx.message.reply_to_message;
  if (
    !repliedMessage ||
    !(repliedMessage.from?.id == ctx.me.id)
  ) {
    return;
  }
  const entity = repliedMessage.entities?.[0];
  if (!entity || entity.type != "text_link") {
    return;
  }
  const prNumber = Number(
    repliedMessage.text?.slice(entity.offset + 1, entity.length),
  );
  if (!prNumber) {
    return;
  }
  let branch = "";
  let res = await fetch(new URL(`pulls/${prNumber}`, env.REPOSITORY_API_URL));
  if (res.status != 200) {
    await ctx.reply("Failed to fetch PR.");
    return;
  }
  branch = (await res.json())?.head?.ref;
  if (!branch) {
    await ctx.reply("Could not resolve PR branch.");
    return;
  }
  const formData = new FormData();
  // https://api.github.com/repos/grammyjs/website/pulls/
  formData.set("repository", env.REPOSITORY_CLONE_URL);
  formData.set("branch", branch);
  formData.set(
    "url",
    new URL(env.BASE_URL, `/file/${ctx.message.document.file_id}`).href,
  );
  res = await fetch(env.PATCH_PUSHER_API_URL, {
    method: "POST",
    body: formData,
  });
  if (res.status == 200) {
    await ctx.reply("Patch submitted.");
  } else {
    console.log(res.status);
    await ctx.reply("Failed to submit the patch.");
  }
});

// app.use(async (ctx, next) => {
//   try {
//     await next();
//   } catch (_err) {
//     ctx.response.status = 500;
//   }
// });

router.post(
  `/${bot.token.replaceAll(":", "\\:")}`,
  webhookCallback(bot, "oak"),
);

router.get(`/file/:file_id`, (ctx) => {
  return fetch(
    `https://api.telegram.org/file/bot${bot.token}/${ctx.params.file_id}`,
  );
});

app.use(router.routes());

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
          notification.messageId,
          updatedText,
          other,
        );
        await db.updateNotification(
          notification.messageId,
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
                notification.messageId,
                text,
                other,
              );
              await db.updateNotification(notification.messageId, text);
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
                notification.messageId,
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
              notification.messageId,
              `__${notification.text}__`,
              other,
            );
            await bot.api.unpinChatMessage(
              env.CHAT_ID,
              notification.messageId,
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

const promises = [db.connect(), app.listen({ port: 8000 })];

if (Deno.env.get("DEBUG")) {
  promises.push(bot.start({ drop_pending_updates: true }));
}

await Promise.all(promises);
