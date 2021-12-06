// deno-lint-ignore-file no-explicit-any camelcase
import {
  Bot,
  InlineKeyboard,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.4.3/mod.ts";
import { serve } from "https://deno.land/std@0.116.0/http/server.ts";
import {
  InlineQueryResultArticle,
  MessageEntity,
} from "https://deno.land/x/grammy@v1.4.3/platform.deno.ts";

const ZWSP = "\u200b"; // zero-width space character

const APPLICATION_ID = "BH4D9OD16A";
const API_KEY = "17b3527aa6f36e8d3fe2276b0f4d9633";

const SEARCH_HOST = `https://${APPLICATION_ID}-dsn.algolia.net`;
const SEARCH_INDEX = "grammy";
const SEARCH_URL = `${SEARCH_HOST}/1/indexes/${SEARCH_INDEX}/query`;

const token = Deno.env.get("BOT_TOKEN");
if (token === undefined) throw new Error("Missing BOT_TOKEN");

const bot = new Bot(token);

bot.drop((ctx) => ctx.msg?.via_bot?.id === ctx.me.id).on(
  "message",
  (ctx) =>
    ctx.reply("I can search for grammY documentation inline.", {
      reply_markup: new InlineKeyboard()
        .switchInlineCurrent("Search here").row()
        .switchInline("Share article"),
    }),
);

const enc = new TextEncoder();
const headers = {
  "X-Algolia-API-Key": API_KEY,
  "X-Algolia-Application-Id": APPLICATION_ID,
};
async function search(query: string) {
  const payload = { params: `query=${query}&facetFilters=["lang:en-US"]` };
  const body = enc.encode(JSON.stringify(payload));
  const res = await fetch(SEARCH_URL, { method: "POST", headers, body });
  return await res.json();
}

bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;
  const { hits } = await search(query);
  hits.length = Math.min(50, hits.length);
  await ctx.answerInlineQuery(
    hits.map((h: any): InlineQueryResultArticle => {
      const { title, iv, url } = getText(h, !h.hierarchy.lvl2);
      const message_text = `${title}${ZWSP}\n\n${url}`;
      const entities: MessageEntity[] = [
        { type: "bold", offset: 0, length: title.length },
        { type: "text_link", offset: title.length, length: 1, url: iv },
      ];
      return {
        id: h.objectID,
        type: "article",
        title,
        description: `${title}: ${
          h.content ?? "Title matches the search query"
        }`,
        input_message_content: { message_text, entities },
      };
    }),
    { cache_time: 24 * 60 * 60 }, // 24 hours (algolia re-indexing)
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
  const iv = `https://t.me/iv?rhash=ca1d23e111bcad&url=${url}`;
  return { title, iv, url };
}

function stripAnchor(url: string) {
  const index = url.lastIndexOf("#");
  return index > 0 ? url.substring(0, index) : url;
}
