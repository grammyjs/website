import type { DocSearchProps } from "node_modules/vitepress/types/docsearch";
import type { LocaleConfig } from "vitepress";
import { social } from "../shared/vars";
import type { NotFound } from "../shared/types";

const learnGuide = {
  text: "Guide",
  items: [
    {
      text: "Overview",
      link: "/guide/",
      activeMatch: "^/guide/$",
    },
    {
      text: "Introduction",
      link: "/guide/introduction",
    },
    {
      text: "Getting Started",
      link: "/guide/getting-started",
    },
    {
      text: "Sending and Receiving Messages",
      link: "/guide/basics",
    },
    {
      text: "Context",
      link: "/guide/context",
    },
    {
      text: "Bot API",
      link: "/guide/api",
    },
    {
      text: "Filter Queries and bot.on()",
      link: "/guide/filter-queries",
    },
    {
      text: "Commands",
      link: "/guide/commands",
    },
    {
      text: "Middleware",
      link: "/guide/middleware",
    },
    {
      text: "Error Handling",
      link: "/guide/errors",
    },
    {
      text: "File Handling",
      link: "/guide/files",
    },
    {
      text: "Games",
      link: "/guide/games",
    },
    {
      text: "Long Polling vs. Webhooks",
      link: "/guide/deployment-types",
    },
  ],
};

const learnAdvanced = {
  text: "Advanced",
  items: [
    {
      text: "Overview",
      link: "/advanced/",
      activeMatch: "^/advanced/$",
    },
    {
      text: "Middleware Redux",
      link: "/advanced/middleware",
    },
    {
      text: "Scaling Up I: Large Codebase",
      link: "/advanced/structuring",
    },
    {
      text: "Scaling Up II: High Load",
      link: "/advanced/scaling",
    },
    {
      text: "Scaling Up III: Reliability",
      link: "/advanced/reliability",
    },
    {
      text: "Scaling Up IV: Flood Limits",
      link: "/advanced/flood",
    },
    {
      text: "Bot API Transformers",
      link: "/advanced/transformers",
    },
    {
      text: "Proxy Support",
      link: "/advanced/proxy",
    },
    {
      text: "Deployment Checklist",
      link: "/advanced/deployment",
    },
  ],
};

const pluginIntroduction = {
  text: "Introduction",
  items: [
    {
      text: "About Plugins",
      link: "/plugins/",
      activeMatch: "^/plugins/$",
    },
    {
      text: "How to Write a Plugin",
      link: "/plugins/guide",
    },
  ],
};

const pluginBuiltin = {
  text: "Built-in",
  items: [
    {
      text: "Sessions and Storing Data",
      link: "/plugins/session",
    },
    {
      text: "Inline and Custom Keyboards",
      link: "/plugins/keyboard",
    },
    {
      text: "Media Groups",
      link: "/plugins/media-group",
    },
    {
      text: "Inline Queries",
      link: "/plugins/inline-query",
    },
  ],
};

const pluginOfficial = {
  text: "Official",
  items: [
    {
      text: "Conversations (conversations)",
      link: "/plugins/conversations",
    },
    {
      text: "Interactive Menus (menu)",
      link: "/plugins/menu",
    },
    {
      text: "Stateless Question (stateless-question)",
      link: "/plugins/stateless-question",
    },
    {
      text: "Concurrency (runner)",
      link: "/plugins/runner",
    },
    {
      text: "Hydration (hydrate)",
      link: "/plugins/hydrate",
    },
    {
      text: "Retry API Requests (auto-retry)",
      link: "/plugins/auto-retry",
    },
    {
      text: "Flood Control (transformer-throttler)",
      link: "/plugins/transformer-throttler",
    },
    {
      text: "Rate Limit Users (ratelimiter)",
      link: "/plugins/ratelimiter",
    },
    {
      text: "Files (files)",
      link: "/plugins/files",
    },
    {
      text: "Internationalization (i18n)",
      link: "/plugins/i18n",
    },
    {
      text: "Internationalization (fluent)",
      link: "/plugins/fluent",
    },
    {
      text: "Router (router)",
      link: "/plugins/router",
    },
    {
      text: "Emoji (emoji)",
      link: "/plugins/emoji",
    },
    {
      text: "Parse Mode (parse-mode)",
      link: "/plugins/parse-mode",
    },
    {
      text: "Chat Members (chat-members)",
      link: "/plugins/chat-members",
    },
  ],
};

const pluginThirdparty = {
  text: "Third-party",
  items: [
    {
      text: "Console Time",
      link: "/plugins/console-time",
    },
    {
      text: "Useful Middleware",
      link: "/plugins/middlewares",
    },
    {
      text: "Autoquote",
      link: "/plugins/autoquote",
    },
    {
      text: "[Submit your PR!]",
      link: "/plugins/#create-your-own-plugins",
    },
  ],
};

const resourcesGrammy = {
  text: "grammY",
  items: [
    {
      text: "About grammY",
      link: "/resources/about",
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
      link: "/resources/faq",
    },
    {
      text: "Comparison to Other Frameworks",
      link: "/resources/comparison",
    },
  ],
};

const resourcesTelegram = {
  text: "Telegram",
  items: [
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
};

const hostingOverview = {
  text: "Overview",
  items: [
    {
      text: "Comparison",
      link: "/hosting/comparison",
    },
  ],
};

const hostingTutorials = {
  text: "Tutorials",
  items: [
    {
      text: "Deno Deploy",
      link: "/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/hosting/supabase",
    },
    {
      text: "Cloudflare Workers",
      link: "/hosting/cloudflare-workers",
    },
    {
      text: "Heroku",
      link: "/hosting/heroku",
    },
    {
      text: "Fly",
      link: "/hosting/fly",
    },
    {
      text: "Firebase Functions",
      link: "/hosting/firebase",
    },
    {
      text: "Google Cloud Functions",
      link: "/hosting/gcf",
    },
    {
      text: "Vercel",
      link: "/hosting/vercel",
    },
    {
      text: "Virtual Private Server",
      link: "/hosting/vps",
    },
  ],
};

export const siteEn: LocaleConfig = {
  root: {
    label: "English",
    lang: "en",
    title: "grammY",
    description: "The Telegram Bot Framework.",
    themeConfig: {
      nav: [
        { text: "Guide", link: "/guide/" },
        {
          text: "Learn",
          items: [learnGuide, learnAdvanced],
        },
        {
          text: "Plugins",
          items: [
            pluginIntroduction,
            pluginBuiltin,
            pluginOfficial,
            pluginThirdparty,
          ],
        },
        {
          text: "Examples",
          items: [
            {
              text: "Examples",
              items: [
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
          items: [resourcesGrammy, resourcesTelegram],
        },
        {
          text: "Hosting",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "API Reference",
          link: "https://deno.land/x/grammy/mod.ts",
        },
      ],
      sidebar: {
        "/guide/": [
          { collapsed: false, ...learnGuide },
          { collapsed: true, ...learnAdvanced },
        ],
        "/advanced/": [
          { collapsed: true, ...learnGuide },
          { collapsed: false, ...learnAdvanced },
        ],
        "/plugins/": [
          { collapsed: false, ...pluginIntroduction },
          { collapsed: false, ...pluginBuiltin },
          { collapsed: false, ...pluginOfficial },
          { collapsed: false, ...pluginThirdparty },
        ],
        "/resources/": [
          { collapsed: false, ...resourcesGrammy },
          { collapsed: false, ...resourcesTelegram },
        ],
        "/hosting/": [
          { collapsed: false, ...hostingOverview },
          { collapsed: false, ...hostingTutorials },
        ],
      },
      outline: {
        level: [2, 6],
        label: "On this page",
      },
      editLink: {
        text: "Edit this page on GitHub",
        pattern:
          "https://github.com/grammyjs/website/edit/main/site/docs/:path",
      },
      docFooter: {
        prev: "Previous page",
        next: "Next page",
      },
      lastUpdatedText: "Last updated",
      darkModeSwitchLabel: "Appearance", // only displayed in the mobile view.
      sidebarMenuLabel: "Menu", // only displayed in the mobile view.
      returnToTopLabel: "Return to top", // only displayed in the mobile view.
      langMenuLabel: "Change language", // Aria-label
      socialLinks: [
        {
          link: social.telegram.link,
          icon: {
            svg: social.telegram.icon,
          },
          ariaLabel: "grammY Telegram group link",
        },
        {
          link: social.github.link,
          icon: social.github.icon,
          ariaLabel: "grammY repository link",
        },
      ],
    },
  },
};

export const searchEn: Record<string, Partial<DocSearchProps>> = {
  root: {
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

export const notFoundEn: Record<string, NotFound> = {
  root: {
    title: "PAGE NOT FOUND",
    backToHome: "Take me hoooooooome",
    ariaLabel: "Go to home",
    messages: [
      "Not Found",
      "Nope.",
      "nothin' here for ya, sorry",
      "Error 404 \nThis Page Could Not Be Found But \nA Haiku Instead",
      "Country rooooaaaads,",
    ],
  },
};
