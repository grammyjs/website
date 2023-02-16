import type { DocsearchLocaleData } from "@vuepress/plugin-docsearch";
import type { DefaultThemeLocaleData } from "@vuepress/theme-default";
import type { LocaleConfig, SiteLocaleConfig } from "vuepress-vite";

// TODO: translate to Russian

export const siteRu: SiteLocaleConfig = {
  "/ru/": {
    lang: "ru-RU",
    title: "grammY",
    description: "The Telegram Bot Framework.",
  },
};

export const localeRu: LocaleConfig<DefaultThemeLocaleData> = {
  "/ru/": {
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
      { text: "Guide", link: "/ru/guide/" },
      {
        text: "Learn",
        children: [
          {
            text: "Guide",
            children: [
              {
                text: "Overview",
                link: "/ru/guide/",
                activeMatch: "^/ru/guide/$",
              },
              {
                text: "Introduction",
                link: "/ru/guide/introduction.html",
              },
              {
                text: "Getting Started",
                link: "/ru/guide/getting-started.html",
              },
              {
                text: "Sending and Receiving Messages",
                link: "/ru/guide/basics.html",
              },
              {
                text: "Context",
                link: "/ru/guide/context.html",
              },
              {
                text: "Bot API",
                link: "/ru/guide/api.html",
              },
              {
                text: "Filter Queries and bot.on()",
                link: "/ru/guide/filter-queries.html",
              },
              {
                text: "Commands",
                link: "/ru/guide/commands.html",
              },
              {
                text: "Middleware",
                link: "/ru/guide/middleware.html",
              },
              {
                text: "Error Handling",
                link: "/ru/guide/errors.html",
              },
              {
                text: "Inline Queries",
                link: "/ru/guide/inline-queries.html",
              },
              {
                text: "File Handling",
                link: "/ru/guide/files.html",
              },
              {
                text: "Games",
                link: "/ru/guide/games.html",
              },
              {
                text: "Long Polling vs. Webhooks",
                link: "/ru/guide/deployment-types.html",
              },
            ],
          },
          {
            text: "Advanced",
            children: [
              {
                text: "Overview",
                link: "/ru/advanced/",
                activeMatch: "^/ru/advanced/$",
              },
              {
                text: "Middleware Redux",
                link: "/ru/advanced/middleware.html",
              },
              {
                text: "Scaling Up I: Large Codebase",
                link: "/ru/advanced/structuring.html",
              },
              {
                text: "Scaling Up II: High Load",
                link: "/ru/advanced/scaling.html",
              },
              {
                text: "Scaling Up III: Reliability",
                link: "/ru/advanced/reliability.html",
              },
              {
                text: "Scaling Up IV: Flood Limits",
                link: "/ru/advanced/flood.html",
              },
              {
                text: "Bot API Transformers",
                link: "/ru/advanced/transformers.html",
              },
              {
                text: "Proxy Support",
                link: "/ru/advanced/proxy.html",
              },
              {
                text: "Deployment Checklist",
                link: "/ru/advanced/deployment.html",
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
                link: "/ru/plugins/",
                activeMatch: "^/ru/plugins/$",
              },
              {
                text: "How to Write a Plugin",
                link: "/ru/plugins/guide.html",
              },
            ],
          },
          {
            text: "Built-in",
            children: [
              {
                text: "Sessions and Storing Data",
                link: "/ru/plugins/session.html",
              },
              {
                text: "Inline and Custom Keyboards",
                link: "/ru/plugins/keyboard.html",
              },
            ],
          },
          {
            text: "Official",
            children: [
              {
                text: "Conversations (conversations)",
                link: "/ru/plugins/conversations.html",
              },
              {
                text: "Interactive Menus (menu)",
                link: "/ru/plugins/menu.html",
              },
              {
                text: "Stateless Question (stateless-question)",
                link: "/ru/plugins/stateless-question.html",
              },
              {
                text: "Concurrency (runner)",
                link: "/ru/plugins/runner.html",
              },
              {
                text: "Hydration (hydrate)",
                link: "/ru/plugins/hydrate.html",
              },
              {
                text: "Retry API Requests (auto-retry)",
                link: "/ru/plugins/auto-retry.html",
              },
              {
                text: "Flood Control (transformer-throttler)",
                link: "/ru/plugins/transformer-throttler.html",
              },
              {
                text: "Rate Limit Users (ratelimiter)",
                link: "/ru/plugins/ratelimiter.html",
              },
              {
                text: "Files (files)",
                link: "/ru/plugins/files.html",
              },
              {
                text: "Internationalization (i18n)",
                link: "/ru/plugins/i18n.html",
              },
              {
                text: "Internationalization (fluent)",
                link: "/ru/plugins/fluent.html",
              },
              {
                text: "Router (router)",
                link: "/ru/plugins/router.html",
              },
              {
                text: "Emoji (emoji)",
                link: "/ru/plugins/emoji.html",
              },
              {
                text: "Parse Mode (parse-mode)",
                link: "/ru/plugins/parse-mode.html",
              },
            ],
          },
          {
            text: "Third-party",
            children: [
              {
                text: "Console Time",
                link: "/ru/plugins/console-time.html",
              },
              {
                text: "Useful Middleware",
                link: "/ru/plugins/middlewares.html",
              },
              {
                text: "Autoquote",
                link: "/ru/plugins/autoquote.html",
              },
              {
                text: "[Submit your PR!]",
                link: "/ru/plugins/#create-your-own-plugins",
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
                link: "/ru/resources/about.html",
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
                link: "/ru/resources/faq.html",
              },
              {
                text: "Comparison to Other Frameworks",
                link: "/ru/resources/comparison.html",
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
                link: "/ru/hosting/comparison.html",
              },
            ],
          },
          {
            text: "Tutorials",
            children: [
              {
                text: "Deno Deploy",
                link: "/ru/hosting/deno-deploy.html",
              },
              {
                text: "Supabase Edge Functions",
                link: "/ru/hosting/supabase.html",
              },
              {
                text: "Heroku",
                link: "/ru/hosting/heroku.html",
              },
              {
                text: "Fly",
                link: "/ru/hosting/fly.html",
              },
              {
                text: "Google Cloud Functions",
                link: "/ru/hosting/gcf.html",
              },
              {
                text: "Vercel",
                link: "/ru/hosting/vercel.html",
              },
              {
                text: "Virtual Private Server",
                link: "/ru/hosting/vps.html",
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

export const docsearchRu: LocaleConfig<DocsearchLocaleData> = {
  "/ru/": {
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
