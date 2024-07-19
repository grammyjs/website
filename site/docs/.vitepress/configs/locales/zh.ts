import type { DocSearchProps } from "node_modules/vitepress/types/docsearch.js";
import type { LocaleConfig } from "vitepress";
import { social } from "../../shared/vars.js";

const learnGuide = {
  text: "指南",
  items: [
    {
      text: "概览",
      link: "/zh/guide/",
      activeMatch: "^/zh/guide/$",
    },
    {
      text: "介绍",
      link: "/zh/guide/introduction",
    },
    {
      text: "入门",
      link: "/zh/guide/getting-started",
    },
    {
      text: "发送和接收消息",
      link: "/zh/guide/basics",
    },
    {
      text: "上下文",
      link: "/zh/guide/context",
    },
    {
      text: "Bot API",
      link: "/zh/guide/api",
    },
    {
      text: "Filter 查询和 bot.on()",
      link: "/zh/guide/filter-queries",
    },
    {
      text: "命令",
      link: "/zh/guide/commands",
    },
    {
      text: "反应",
      link: "/zh/guide/reactions",
    },
    {
      text: "中间件",
      link: "/zh/guide/middleware",
    },
    {
      text: "错误处理",
      link: "/zh/guide/errors",
    },
    {
      text: "文件管理",
      link: "/zh/guide/files",
    },
    {
      text: "游戏",
      link: "/zh/guide/games",
    },
    {
      text: "长轮询 vs. Webhooks",
      link: "/zh/guide/deployment-types",
    },
  ],
};

const learnAdvanced = {
  text: "进阶",
  items: [
    {
      text: "概览",
      link: "/zh/advanced/",
      activeMatch: "^/zh/advanced/$",
    },
    {
      text: "重构中间件",
      link: "/zh/advanced/middleware",
    },
    {
      text: "I: 代码组织",
      link: "/zh/advanced/structuring",
    },
    {
      text: "II: 高负载",
      link: "/zh/advanced/scaling",
    },
    {
      text: "III: 可靠性",
      link: "/zh/advanced/reliability",
    },
    {
      text: "IV: 流量限制",
      link: "/zh/advanced/flood",
    },
    {
      text: "Bot API Transformers",
      link: "/zh/advanced/transformers",
    },
    {
      text: "Telegram Business",
      link: "/zh/advanced/business",
    },
    {
      text: "代理支持",
      link: "/zh/advanced/proxy",
    },
    {
      text: "部署检查清单",
      link: "/zh/advanced/deployment",
    },
  ],
};

const pluginIntroduction = {
  text: "介绍",
  items: [
    {
      text: "关于插件",
      link: "/zh/plugins/",
      activeMatch: "^/zh/plugins/$",
    },
    {
      text: "如何编写插件",
      link: "/zh/plugins/guide",
    },
  ],
};

const pluginBuiltin = {
  text: "内置插件",
  items: [
    {
      text: "会话与数据储存",
      link: "/zh/plugins/session",
    },
    {
      text: "Inline 与自定义 Keyboards",
      link: "/zh/plugins/keyboard",
    },
    {
      text: "媒体组",
      link: "/zh/plugins/media-group",
    },
    {
      text: "Inline Queries",
      link: "/zh/plugins/inline-query",
    },
  ],
};

const pluginOfficial = {
  text: "官方插件",
  items: [
    {
      text: "对话 (conversations)",
      link: "/zh/plugins/conversations",
    },
    {
      text: "互动菜单 (menu)",
      link: "/zh/plugins/menu",
    },
    {
      text: "无状态问题 (stateless-question)",
      link: "/zh/plugins/stateless-question",
    },
    {
      text: "并发 (runner)",
      link: "/zh/plugins/runner",
    },
    {
      text: "Hydration (hydrate)",
      link: "/zh/plugins/hydrate",
    },
    {
      text: "重试 API 请求 (auto-retry)",
      link: "/zh/plugins/auto-retry",
    },
    {
      text: "流量控制 (transformer-throttler)",
      link: "/zh/plugins/transformer-throttler",
    },
    {
      text: "流量控制 (ratelimiter)",
      link: "/zh/plugins/ratelimiter",
    },
    {
      text: "文件助手 (files)",
      link: "/zh/plugins/files",
    },
    {
      text: "国际化 (i18n)",
      link: "/zh/plugins/i18n",
    },
    {
      text: "国际化 (fluent)",
      link: "/zh/plugins/fluent",
    },
    {
      text: "路由器 (router)",
      link: "/zh/plugins/router",
    },
    {
      text: "Emoji (emoji)",
      link: "/zh/plugins/emoji",
    },
    {
      text: "解析模式 (parse-mode)",
      link: "/zh/plugins/parse-mode",
    },
    {
      text: "聊天成员 (chat-members)",
      link: "/zh/plugins/chat-members",
    },
  ],
};

const pluginThirdparty = {
  text: "第三方插件",
  items: [
    {
      text: "调试时输出日志",
      link: "/zh/plugins/console-time",
    },
    {
      text: "有用的中间件",
      link: "/zh/plugins/middlewares",
    },
    {
      text: "自动引用",
      link: "/zh/plugins/autoquote",
    },
    {
      text: "[提交你的 PR!]",
      link: "/zh/plugins/#创建你自己的插件",
    },
  ],
};

const resourcesGrammy = {
  text: "grammY",
  items: [
    {
      text: "关于 grammY",
      link: "/zh/resources/about",
    },
    {
      text: "社区聊天（英语）",
      link: "https://t.me/grammyjs",
    },
    {
      text: "社区聊天（俄语）",
      link: "https://t.me/grammyjs_ru",
    },
    {
      text: "新闻",
      link: "https://t.me/grammyjs_news",
    },
    {
      text: "Twitter",
      link: "https://twitter.com/grammy_js",
    },
    {
      text: "FAQ",
      link: "/zh/resources/faq",
    },
    {
      text: "与其他框架的比较",
      link: "/zh/resources/comparison",
    },
  ],
};

const resourcesTelegram = {
  text: "Telegram",
  items: [
    {
      text: "面向开发者的介绍",
      link: "https://core.telegram.org/bots",
    },
    {
      text: "Bots FAQ",
      link: "https://core.telegram.org/bots/faq",
    },
    {
      text: "Bot 特性",
      link: "https://core.telegram.org/bots/features",
    },
    {
      text: "Bot API 参考",
      link: "https://core.telegram.org/bots/api",
    },
    {
      text: "Updates 示例",
      link:
        "https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates",
    },
  ],
};

const resourcesTools = {
  text: "工具",
  items: [
    {
      text: "telegram.tools",
      link: "https://telegram.tools",
    },
    {
      text: "VS Code 扩展",
      link: "https://github.com/grammyjs/vscode",
    },
  ],
};

const hostingOverview = {
  text: "概览",
  items: [
    {
      text: "对比",
      link: "/zh/hosting/comparison",
    },
  ],
};

const hostingTutorials = {
  text: "教程",
  items: [
    {
      text: "Virtual Private Server (VPS)",
      link: "/zh/hosting/vps",
    },
    {
      text: "Deno Deploy",
      link: "/zh/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/zh/hosting/supabase",
    },
    {
      text: "Cloudflare Workers (Deno)",
      link: "/zh/hosting/cloudflare-workers",
    },
    {
      text: "Cloudflare Workers (Node.js)",
      link: "/zh/hosting/cloudflare-workers-nodejs",
    },
    {
      text: "Fly",
      link: "/zh/hosting/fly",
    },
    {
      text: "Firebase Functions",
      link: "/zh/hosting/firebase",
    },
    {
      text: "Vercel",
      link: "/zh/hosting/vercel",
    },
    {
      text: "Zeabur (Deno)",
      link: "/zh/hosting/zeabur-deno",
    },
    {
      text: "Zeabur (Node.js)",
      link: "/zh/hosting/zeabur-nodejs",
    },
    {
      text: "Heroku",
      link: "/zh/hosting/heroku",
    },
  ],
};

export const siteZh: LocaleConfig = {
  zh: {
    label: "简体中文",
    lang: "zh-CN",
    title: "grammY",
    description: "Telegram Bot 框架。",
    themeConfig: {
      nav: [
        { text: "指南", link: "/zh/guide/" },
        {
          text: "学习",
          items: [learnGuide, learnAdvanced],
        },
        {
          text: "插件",
          items: [
            pluginIntroduction,
            pluginBuiltin,
            pluginOfficial,
            pluginThirdparty,
          ],
        },
        {
          text: "示例",
          items: [
            {
              text: "示例",
              items: [
                {
                  text: "Awesome grammY",
                  link: "https://github.com/grammyjs/awesome-grammY",
                },
                {
                  text: "示例 Bots 仓库",
                  link: "https://github.com/grammyjs/examples",
                },
              ],
            },
          ],
        },
        {
          text: "资源",
          items: [resourcesGrammy, resourcesTelegram, resourcesTools],
        },
        {
          text: "托管服务",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "API 参考",
          link: "/ref/",
        },
      ],
      sidebar: {
        "/zh/guide/": [
          { collapsed: false, ...learnGuide },
          { collapsed: true, ...learnAdvanced },
        ],
        "/zh/advanced/": [
          { collapsed: true, ...learnGuide },
          { collapsed: false, ...learnAdvanced },
        ],
        "/zh/plugins/": [
          { collapsed: false, ...pluginIntroduction },
          { collapsed: false, ...pluginBuiltin },
          { collapsed: false, ...pluginOfficial },
          { collapsed: false, ...pluginThirdparty },
        ],
        "/zh/resources/": [
          { collapsed: false, ...resourcesGrammy },
          { collapsed: false, ...resourcesTelegram },
        ],
        "/zh/hosting/": [
          { collapsed: false, ...hostingOverview },
          { collapsed: false, ...hostingTutorials },
        ],
      },
      outline: {
        level: [2, 6],
        label: "在此页面",
      },
      editLink: {
        text: "在 GitHub 上编辑此页面",
        pattern:
          "https://github.com/grammyjs/website/edit/main/site/docs/:path",
      },
      docFooter: {
        prev: "上一页",
        next: "下一页",
      },
      lastUpdatedText: "上次更新",
      darkModeSwitchLabel: "外观", // only displayed in the mobile view.
      sidebarMenuLabel: "菜单", // only displayed in the mobile view.
      returnToTopLabel: "回到顶部", // only displayed in the mobile view.
      langMenuLabel: "切换语言", // Aria-label
      socialLinks: [
        {
          link: social.telegram.link,
          icon: {
            svg: social.telegram.icon,
          },
          ariaLabel: "grammY Telegram 群链接",
        },
        {
          link: social.github.link,
          icon: social.github.icon,
          ariaLabel: "grammY 仓库链接",
        },
      ],
      notFound: {
        code: "404",
        title: "此页面不存在",
        linkText: "回到首页",
        linkLabel: "回到首页",
        messages: [
          "糟糕！这个页面不存在。",
          "无",
          "抱歉，这里还不存在内容。",
          "Error 404 \n页面不存在，但一只小可爱替代了他~",
          "回家吧，回到最初的美好。",
        ],
      },
    },
  },
};

export const searchZh: Record<string, Partial<DocSearchProps>> = {
  zh: {
    placeholder: "搜索",
    translations: {
      button: {
        buttonText: "搜索",
        buttonAriaLabel: "搜索",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "清除查询",
          resetButtonAriaLabel: "清除查询",
          cancelButtonText: "取消",
          cancelButtonAriaLabel: "取消",
        },
        startScreen: {
          recentSearchesTitle: "最近搜索",
          noRecentSearchesText: "没有最近搜索",
          saveRecentSearchButtonTitle: "保存此搜索",
          removeRecentSearchButtonTitle: "从历史中删除此搜索",
          favoriteSearchesTitle: "收藏",
          removeFavoriteSearchButtonTitle: "从收藏中删除此搜索",
        },
        errorScreen: {
          titleText: "无法获取结果",
          helpText: "你可能需要检查你的网络连接",
        },
        footer: {
          selectText: "选择",
          selectKeyAriaLabel: "回车键",
          navigateText: "导航",
          navigateUpKeyAriaLabel: "上键",
          navigateDownKeyAriaLabel: "下键",
          closeText: "关闭",
          closeKeyAriaLabel: "Esc键",
          searchByText: "按搜索",
        },
        noResultsScreen: {
          noResultsText: "没有结果",
          suggestedQueryText: "试试搜索",
          reportMissingResultsText: "相信这个查询应该返回结果？",
          reportMissingResultsLinkText: "让我们知道。",
        },
      },
    },
  },
};
