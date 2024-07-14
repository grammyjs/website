import type { DocSearchProps } from "node_modules/vitepress/types/docsearch.js";
import type { LocaleConfig } from "vitepress";
import { social } from "../../shared/vars.js";

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
      text: "Reactions",
      link: "/guide/reactions",
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
      text: "Telegram Business",
      link: "/advanced/business",
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
      // do not add the following line to translations:
      activeMatch: "^(/plugins/conversations|/ref/conversations/)$",
    },
    {
      text: "Interactive Menus (menu)",
      link: "/plugins/menu",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/menu|/ref/menu/)$",
    },
    {
      text: "Stateless Question (stateless-question)",
      link: "/plugins/stateless-question",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/stateless-question|/ref/stateless-question/)$",
    },
    {
      text: "Concurrency (runner)",
      link: "/plugins/runner",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/runner|/ref/runner/)$",
    },
    {
      text: "Hydration (hydrate)",
      link: "/plugins/hydrate",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/hydrate|/ref/hydrate/)$",
    },
    {
      text: "Retry API Requests (auto-retry)",
      link: "/plugins/auto-retry",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/auto-retry|/ref/auto-retry/)$",
    },
    {
      text: "Flood Control (transformer-throttler)",
      link: "/plugins/transformer-throttler",
      // do not add the following line to translations:
      activeMatch:
        "^(/plugins/transformer-throttler|/ref/transformer-throttler/)$",
    },
    {
      text: "Rate Limit Users (ratelimiter)",
      link: "/plugins/ratelimiter",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/ratelimiter|/ref/ratelimiter/)$",
    },
    {
      text: "Files (files)",
      link: "/plugins/files",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/files|/ref/files/)$",
    },
    {
      text: "Internationalization (i18n)",
      link: "/plugins/i18n",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/i18n|/ref/i18n/)$",
    },
    {
      text: "Internationalization (fluent)",
      link: "/plugins/fluent",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/fluent|/ref/fluent/)$",
    },
    {
      text: "Router (router)",
      link: "/plugins/router",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/router|/ref/router/)$",
    },
    {
      text: "Emoji (emoji)",
      link: "/plugins/emoji",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/emoji|/ref/emoji/)$",
    },
    {
      text: "Parse Mode (parse-mode)",
      link: "/plugins/parse-mode",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/parse-mode|/ref/parse-mode/)$",
    },
    {
      text: "Chat Members (chat-members)",
      link: "/plugins/chat-members",
      // do not add the following line to translations:
      activeMatch: "^(/plugins/chat-members|/ref/chat-members/)$",
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

const resourcesTools = {
  text: "Tools",
  items: [
    {
      text: "telegram.tools",
      link: "https://telegram.tools",
    },
    {
      text: "VS Code Extension",
      link: "https://github.com/grammyjs/vscode",
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
      text: "Virtual Private Server (VPS)",
      link: "/hosting/vps",
    },
    {
      text: "Deno Deploy",
      link: "/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/hosting/supabase",
    },
    {
      text: "Cloudflare Workers (Deno)",
      link: "/hosting/cloudflare-workers",
    },
    {
      text: "Cloudflare Workers (Node.js)",
      link: "/hosting/cloudflare-workers-nodejs",
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
      text: "Vercel",
      link: "/hosting/vercel",
    },
    {
      text: "Zeabur (Deno)",
      link: "/hosting/zeabur-deno",
    },
    {
      text: "Zeabur (Node.js)",
      link: "/hosting/zeabur-nodejs",
    },
    {
      text: "Heroku",
      link: "/hosting/heroku",
    },
  ],
};

export const siteEn: LocaleConfig = {
  root: {
    label: "English",
    lang: "en-US",
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
          items: [resourcesGrammy, resourcesTelegram, resourcesTools],
        },
        {
          text: "Hosting",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "API Reference",
          link: "/ref/",
          // do not add the following line to translations:
          activeMatch: "^/ref/",
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
      notFound: {
        code: "404",
        title: "PAGE NOT FOUND",
        linkText: "Take me hoooooooome",
        linkLabel: "Go to home",
        messages: [
          "Not Found",
          "Nope.",
          "nothin' here for ya, sorry",
          "Error 404 \nThis Page Could Not Be Found But \nA Haiku Instead",
          "Country rooooaaaads,",
        ],
      },
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
