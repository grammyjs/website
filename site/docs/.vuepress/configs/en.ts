import type { DocsearchLocaleData } from "@vuepress/plugin-docsearch";
import type { DefaultThemeLocaleData } from "@vuepress/theme-default";
import type { LocaleConfig, SiteLocaleConfig } from "vuepress-vite";

export const siteEn: SiteLocaleConfig = {
  "/": {
    lang: "en-US",
    title: "grammY",
    description: "The Telegram Bot Framework.",
  },
};

export const localeEn: LocaleConfig<DefaultThemeLocaleData> = {
  "/": {
    selectLanguageText: "Languages",
    selectLanguageName: "English",
    editLinkText: "Edit this page on GitHub",
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
                link: "/guide/",
                activeMatch: "^/guide/$",
              },
              {
                text: "Introduction",
                link: "/guide/introduction.html",
              },
              {
                text: "Getting Started",
                link: "/guide/getting-started.html",
              },
              {
                text: "Sending and Receiving Messages",
                link: "/guide/basics.html",
              },
              {
                text: "Context",
                link: "/guide/context.html",
              },
              {
                text: "Bot API",
                link: "/guide/api.html",
              },
              {
                text: "Filter Queries and bot.on()",
                link: "/guide/filter-queries.html",
              },
              {
                text: "Commands",
                link: "/guide/commands.html",
              },
              {
                text: "Middleware",
                link: "/guide/middleware.html",
              },
              {
                text: "Error Handling",
                link: "/guide/errors.html",
              },
              {
                text: "Inline Queries",
                link: "/guide/inline-queries.html",
              },
              {
                text: "File Handling",
                link: "/guide/files.html",
              },
              {
                text: "Games",
                link: "/guide/games.html",
              },
              {
                text: "Long Polling vs. Webhooks",
                link: "/guide/deployment-types.html",
              },
            ],
          },
          {
            text: "Advanced",
            children: [
              {
                text: "Overview",
                link: "/advanced/",
                activeMatch: "^/advanced/$",
              },
              {
                text: "Middleware Redux",
                link: "/advanced/middleware.html",
              },
              {
                text: "Scaling Up I: Large Codebase",
                link: "/advanced/structuring.html",
              },
              {
                text: "Scaling Up II: High Load",
                link: "/advanced/scaling.html",
              },
              {
                text: "Scaling Up III: Reliability",
                link: "/advanced/reliability.html",
              },
              {
                text: "Scaling Up IV: Flood Limits",
                link: "/advanced/flood.html",
              },
              {
                text: "Bot API Transformers",
                link: "/advanced/transformers.html",
              },
              {
                text: "Proxy Support",
                link: "/advanced/proxy.html",
              },
              {
                text: "Deployment Checklist",
                link: "/advanced/deployment.html",
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
                link: "/plugins/",
                activeMatch: "^/plugins/$",
              },
              {
                text: "How to Write a Plugin",
                link: "/plugins/guide.html",
              },
            ],
          },
          {
            text: "Built-in",
            children: [
              {
                text: "Sessions and Storing Data",
                link: "/plugins/session.html",
              },
              {
                text: "Inline and Custom Keyboards",
                link: "/plugins/keyboard.html",
              },
            ],
          },
          {
            text: "Official",
            children: [
              {
                text: "Conversations (conversations)",
                link: "/plugins/conversations.html",
              },
              {
                text: "Interactive Menus (menu)",
                link: "/plugins/menu.html",
              },
              {
                text: "Stateless Question (stateless-question)",
                link: "/plugins/stateless-question.html",
              },
              {
                text: "Concurrency (runner)",
                link: "/plugins/runner.html",
              },
              {
                text: "Hydration (hydrate)",
                link: "/plugins/hydrate.html",
              },
              {
                text: "Retry API Requests (auto-retry)",
                link: "/plugins/auto-retry.html",
              },
              {
                text: "Flood Control (transformer-throttler)",
                link: "/plugins/transformer-throttler.html",
              },
              {
                text: "Rate Limit Users (ratelimiter)",
                link: "/plugins/ratelimiter.html",
              },
              {
                text: "Files (files)",
                link: "/plugins/files.html",
              },
              {
                text: "Internationalization (i18n)",
                link: "/plugins/i18n.html",
              },
              {
                text: "Internationalization (fluent)",
                link: "/plugins/fluent.html",
              },
              {
                text: "Router (router)",
                link: "/plugins/router.html",
              },
              {
                text: "Emoji (emoji)",
                link: "/plugins/emoji.html",
              },
              {
                text: "Parse Mode (parse-mode)",
                link: "/plugins/parse-mode.html",
              },
            ],
          },
          {
            text: "Third-party",
            children: [
              {
                text: "Console Time",
                link: "/plugins/console-time.html",
              },
              {
                text: "Useful Middleware",
                link: "/plugins/middlewares.html",
              },
              {
                text: "Autoquote",
                link: "/plugins/autoquote.html",
              },
              {
                text: "[Submit your PR!]",
                link: "/plugins/#create-your-own-plugins",
              },
            ],
          },
        ],
      },
      {
        text: "Examples",
        children: [
          {
            text: "Examples",
            children: [
              {
                text: "Awesome grammY",
                link: "https://github.com/grammyjs/awesome-grammY",
              },
              {
                text: "Example Bots Repository",
                link: "https://github.com/grammyjs/examples",
              },
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
                text: "About grammY",
                link: "/resources/about.html",
              },
              {
                text: "Community Chat (English)",
                link: "https://t.me/grammyjs",
              },
              {
                text: "Community Chat (Russian)",
                link: "https://t.me/grammyjs_ru",
              },
              {
                text: "News",
                link: "https://t.me/grammyjs_news",
              },
              {
                text: "Twitter",
                link: "https://twitter.com/grammy_js",
              },
              {
                text: "FAQ",
                link: "/resources/faq.html",
              },
              {
                text: "Comparison to Other Frameworks",
                link: "/resources/comparison.html",
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
                text: "Bot Features",
                link: "https://core.telegram.org/bots/features",
              },
              {
                text: "Bot API Reference",
                link: "https://core.telegram.org/bots/api",
              },
              {
                text: "Example Updates",
                link:
                  "https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates",
              },
            ],
          },
        ],
      },
      {
        text: "Hosting",
        children: [
          {
            text: "Overview",
            children: [
              {
                text: "Comparison",
                link: "/hosting/comparison.html",
              },
            ],
          },
          {
            text: "Tutorials",
            children: [
              {
                text: "Deno Deploy",
                link: "/hosting/deno-deploy.html",
              },
              {
                text: "Supabase Edge Functions",
                link: "/hosting/supabase.html",
              },
              {
                text: "Cloudflare Workers",
                link: "/hosting/cloudflare-workers.html",
              },
              {
                text: "Heroku",
                link: "/hosting/heroku.html",
              },
              {
                text: "Fly",
                link: "/hosting/fly.html",
              },
              {
                text: "Google Cloud Functions",
                link: "/hosting/gcf.html",
              },
              {
                text: "Vercel",
                link: "/hosting/vercel.html",
              },
              {
                text: "Virtual Private Server",
                link: "/hosting/vps.html",
              },
            ],
          },
        ],
      },
      {
        text: "API Reference",
        link: "https://deno.land/x/grammy/mod.ts",
      },
    ],
  },
};

export const docsearchEn: LocaleConfig<DocsearchLocaleData> = {
  "/": {
    placeholder: "Search",
    translations: {
      button: {
        buttonText: "Search",
        buttonAriaLabel: "Search",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "Clear the query",
          resetButtonAriaLabel: "Clear the query",
          cancelButtonText: "Cancel",
          cancelButtonAriaLabel: "Cancel",
        },
        startScreen: {
          recentSearchesTitle: "Recent",
          noRecentSearchesText: "No recent searches",
          saveRecentSearchButtonTitle: "Save this search",
          removeRecentSearchButtonTitle: "Remove this search from history",
          favoriteSearchesTitle: "Favorite",
          removeFavoriteSearchButtonTitle: "Remove this search from favorites",
        },
        errorScreen: {
          titleText: "Unable to fetch results",
          helpText: "You might want to check your network connection.",
        },
        footer: {
          selectText: "to select",
          selectKeyAriaLabel: "Enter key",
          navigateText: "to navigate",
          navigateUpKeyAriaLabel: "Arrow up",
          navigateDownKeyAriaLabel: "Arrow down",
          closeText: "to close",
          closeKeyAriaLabel: "Escape key",
          searchByText: "Search by",
        },
        noResultsScreen: {
          noResultsText: "No results for",
          suggestedQueryText: "Try searching for",
          reportMissingResultsText: "Believe this query should return results?",
          reportMissingResultsLinkText: "Let us know.",
        },
      },
    },
  },
};
