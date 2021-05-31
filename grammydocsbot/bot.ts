import express from "express";
import algoliasearch from "algoliasearch";
import { Bot, InlineKeyboard, webhookCallback } from "grammy";

const client = algoliasearch("BH4D9OD16A", "17b3527aa6f36e8d3fe2276b0f4d9633");
const index = client.initIndex("grammy");

const token = process.env.BOT_TOKEN;
if (token === undefined) throw new Error("Missing BOT_TOKEN");

const bot = new Bot(token);

bot.on("message", (ctx) =>
  ctx.reply("I can search for grammY documentation inline.", {
    reply_markup: new InlineKeyboard().switchInline("Search"),
  })
);

bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;
  const { hits } = await index.search(query);
  hits.length = Math.min(50, hits.length);
  await ctx.answerInlineQuery(
    hits.map((h: any) => ({
      id: h.objectID,
      type: "article",
      title: getTitle(h),
      description:
        getTitle(h) + ": " + (h.content ?? "Title matches the search query"),
      input_message_content: {
        message_text: getText(h, !h.hierarchy.lvl2),
        parse_mode: "HTML",
      },
    })),
    {
      cache_time: 24 * 60 * 60, // 24 hours (algolia re-indexing)
    }
  );
});

if (process.env.DEBUG) {
  bot.catch(console.error);
  bot.start();
} else {
  const port = process.env.PORT || 8080;
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot));
  app.listen(port, () =>
    bot.api.setWebhook("https://grammydocsbot.herokuapp.com/", {
      drop_pending_updates: true,
    })
  );
}

function getTitle(hit: any) {
  const h = hit.hierarchy;
  const headers = [h.lvl1, h.lvl2, h.lvl3, h.lvl4, h.lvl5, h.lvl6];
  return headers.filter((t) => !!t).join(" / ");
}

function getText(hit: any, strip: boolean) {
  const title = getTitle(hit);
  const url = strip ? stripAnchor(hit.url) : hit.url;
  return `<b>${title}</b>

${url}`;
}

function stripAnchor(url: string) {
  const index = url.lastIndexOf("#");
  return index > 0 ? url.substring(0, index) : url;
}
