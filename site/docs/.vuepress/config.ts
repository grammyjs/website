import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";

export default defineUserConfig<DefaultThemeOptions>({
  title: "grammY",
  description: "The Telegram Bot Framework.",

  themeConfig: {
    logo: "/logo.jpg",
    repo: "https://github.com/grammyjs/grammY",
    docsRepo: "https://github.com/grammyjs/grammy-website",
    docsDir: "site",
    repoLabel: "GitHub",
    notFound: [
      "Not Found",
      "Nope.",
      "nothin' here for ya, sorry",
      "Error 404/ This Page Could Not Be Found But/ A Haiku Instead",
      "Country rooooaaaads,",
    ],
    backToHome: "Take me hoooooooome",
    navbar: [
      { text: "Guide", link: "/guide/" },
      {
        text: "API Reference",
        link: "https://doc.deno.land/https/deno.land/x/grammy/mod.ts",
      },
      {
        text: "Resources",
        children: [
          {
            text: "grammY",
            children: [
              {
                text: "Examples",
                link: "https://github.com/grammyjs/examples#readme",
              },
              {
                text: "News",
                link: "https://t.me/grammyjs_news",
              },
              {
                text: "Community Chat",
                link: "https://t.me/grammyjs",
              },
            ],
          },
          {
            text: "Telegram",
            children: [
              {
                text: "Introduction for Developers",
                link: "https://core.telegram.org/bots",
              },
              {
                text: "Official Bot API Reference",
                link: "https://core.telegram.org/bots/api",
              },
            ],
          },
        ],
      },
    ],
  },
});
