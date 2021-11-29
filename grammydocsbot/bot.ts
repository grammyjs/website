import {
  Bot,
  InlineKeyboard,
  webhookCallback,
} from "https://raw.githubusercontent.com/grammyjs/grammY/1620cc3cf0f1cd453fc6e6b8a3446ea878357547/src/mod.ts";
import algoliasearch from "https://cdn.skypack.dev/algoliasearch@4.11.0?dts";
import { serve } from "https://deno.land/std@0.116.0/http/server.ts";

const client = algoliasearch("BH4D9OD16A", "17b3527aa6f36e8d3fe2276b0f4d9633");
const index = client.initIndex("grammy");

const token = Deno.env.get("BOT_TOKEN");
if (token === undefined) throw new Error("Missing BOT_TOKEN");

const bot = new Bot(token);

bot.on(
  "message",
  (ctx) =>
    ctx.reply("I can search for grammY documentation inline.", {
      reply_markup: new InlineKeyboard()
        .switchInlineCurrent("Search here").row()
        .switchInline("Share article"),
    }),
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
      description: getTitle(h) + ": " +
        (h.content ?? "Title matches the search query"),
      input_message_content: {
        message_text: getText(h, !h.hierarchy.lvl2),
        parse_mode: "HTML",
      },
    })),
    {
      cache_time: 24 * 60 * 60, // 24 hours (algolia re-indexing)
    },
  );
});

if (Deno.env.get("DEBUG")) {
  bot.catch(console.error);
  bot.start();
} else {
  serve(webhookCallback(bot, "std/http"));
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
