import algoliasearch from "algoliasearch";
import { Bot } from "grammy";

const client = algoliasearch("BH4D9OD16A", "17b3527aa6f36e8d3fe2276b0f4d9633");
const index = client.initIndex("grammy");

index
  .search("context")
  .then((...x: any[]) => console.log(JSON.stringify(x)))
  .catch(console.error);

const token = process.env.BOT_TOKEN;
if (token === undefined) throw new Error("Missing BOT_TOKEN");

const bot = new Bot(token);

bot.on("message", (ctx) =>
  ctx.reply("I can search for grammY documentation inline.")
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
        message_text: getText(h, !h.content),
        parse_mode: "HTML",
      },
    })),
    {
      cache_time: 1,
    }
  );
});

bot.catch(console.error);

bot.start();

function getTitle(hit: any) {
  console.log(JSON.stringify(hit));
  const h = hit.hierarchy;
  const headers = [h.lvl0, h.lvl1, h.lvl2, h.lvl3, h.lvl4, h.lvl5, h.lvl6];
  return headers.filter((t) => t!!).join(" / ");
}

function getText(hit: any, strip: boolean) {
  return (
    "<b>" +
    getTitle(hit) +
    "</b>\n\n" +
    (strip ? stripAnchor(hit.url) : hit.url)
  );
}

function stripAnchor(url: string) {
  const index = url.lastIndexOf("#");
  return index > 0 ? url.substring(0, index) : url;
}
