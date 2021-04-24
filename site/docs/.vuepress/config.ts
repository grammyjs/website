import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";

export default defineUserConfig<DefaultThemeOptions>({
  title: "grammY",
  description: "The Telegram Bot Framework.",

  themeConfig: {
    logo: "/Y.png",
    repo: "https://github.com/grammyjs/grammY",
    docsRepo: "https://github.com/grammyjs/website",
    docsDir: "site/docs",
    docsBranch: "main",
    editLink: true,
    editLinkText: "Edit this page on GitHub",
    editLinkPattern: ":repo/edit/:branch/:path",
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
        text: "Learn",
        children: [
          {
            text: "Guide",
            children: [
              {
                text: "Overview",
                link: "/guide/README.md",
              },
              {
                text: "Introduction",
                link: "/guide/introduction.md",
              },
              {
                text: "Getting started",
                link: "/guide/getting-started.md",
              },
              {
                text: "Sending and receiving messages",
                link: "/guide/basics.md",
              },
              {
                text: "Context",
                link: "/guide/context.md",
              },
              {
                text: "Bot API",
                link: "/guide/api.md",
              },
              {
                text: "Filter queries and bot.on()",
                link: "/guide/filter-queries.md",
              },
              {
                text: "Commands",
                link: "/guide/commands.md",
              },
              {
                text: "Middleware",
                link: "/guide/middleware.md",
              },
              {
                text: "Error handling",
                link: "/guide/errors.md",
              },
              {
                text: "Inline Queries",
                link: "/guide/inline-queries.md",
              },
              {
                text: "File handling",
                link: "/guide/files.md",
              },
              {
                text: "Long Polling vs. Webhooks",
                link: "/guide/deployment-types.md",
              },
            ],
          },
          {
            text: "Advanced",
            children: [
              {
                text: "Overview",
                link: "/advanced/README.md",
              },
              {
                text: "Middleware redux",
                link: "/advanced/middleware.md",
              },
              {
                text: "Scaling Up I: Large codebase",
                link: "/advanced/structuring.md",
              },
              {
                text: "Scaling Up II: High load",
                link: "/advanced/scaling.md",
              },
              {
                text: "Scaling Up III: Reliability",
                link: "/advanced/reliability.md",
              },
              {
                text: "Bot API Transformers",
                link: "/advanced/transformers.md",
              },
              {
                text: "Proxy Support",
                link: "/advanced/proxies.md",
              },
              {
                text: "Deployment Checklist",
                link: "/advanced/deployment.md",
              },
            ],
          },
        ],
      },
      {
        text: "Plugins",
        children: [
          {
            text: "Introduction",
            children: [
              {
                text: "About Plugins",
                link: "/plugins/README.md",
              },
            ],
          },
          {
            text: "Official",
            children: [
              {
                text: "Sessions and storing data (built-in)",
                link: "/plugins/session.md",
              },
              {
                text: "Keyboards and Inline Keyboards (built-in)",
                link: "/plugins/keyboard.md",
              },
              {
                text: "Concurrency (runner)",
                link: "/plugins/runner.md",
              },
              {
                text: "Internationalization (i18n)",
                link: "/plugins/i18n.md",
              },
              {
                text: "Router (router)",
                link: "/plugins/router.md",
              },
            ],
          },
          {
            text: "Third-party",
            children: [
              {
                text: "[Submit your PR!]",
                link: "/plugins/README.md#submitting-your-own-package-to-the-docs",
              },
            ],
          },
        ],
      },
      {
        text: "Demo",
        children: [
          {
            text: "Demo",
            children: [
              { text: "Browser Demo", link: "/demo/README.md" },
              { text: "Example Bots", link: "/demo/examples.md" },
              { text: "Community Showlounge", link: "/demo/showlounge.md" },
            ],
          },
        ],
      },
      {
        text: "Resources",
        children: [
          {
            text: "grammY",
            children: [
              {
                text: "Community Chat",
                link: "https://telegram.me/grammyjs",
              },
              {
                text: "Example Bots Repository",
                link: "https://github.com/grammyjs/examples#readme",
              },
              {
                text: "News",
                link: "https://telegram.me/grammyjs_news",
              },
              {
                text: "FAQ",
                link: "/resources/faq.md",
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
                text: "Bots FAQ",
                link: "https://core.telegram.org/bots/faq",
              },
              {
                text: "Bot API Reference",
                link: "https://core.telegram.org/bots/api",
              },
            ],
          },
          {
            text: "Hosting",
            children: [
              {
                text: "Google Cloud Functions",
                link: "/hosting/gcf.md",
              },
            ],
          },
        ],
      },
      {
        text: "API Reference",
        link: "https://doc.deno.land/https/deno.land/x/grammy/mod.ts",
      },
    ],
  },
  plugins: [
    [
      "@vuepress/plugin-docsearch",
      {
        apiKey: "17b3527aa6f36e8d3fe2276b0f4d9633",
        indexName: "grammy",
        placeholder: "Search",
        algoliaOptions: { facetFilters: ["lang:en-US"] },
      },
    ],
  ],
});
