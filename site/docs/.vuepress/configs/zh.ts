import type { DocsearchLocaleData } from "@vuepress/plugin-docsearch";
import type { DefaultThemeLocaleData } from "@vuepress/theme-default";
import type { LocaleConfig, SiteLocaleConfig } from "vuepress-vite";

export const siteZh: SiteLocaleConfig = {
  "/zh": {
    lang: "zh-CN",
    title: "grammY",
    description: "Telegram Bot 框架.",
  },
};

export const localeZh: LocaleConfig<DefaultThemeLocaleData> = {
  "/zh": {
    selectLanguageText: "语言",
    selectLanguageName: "简体中文",
    editLinkText: "在 GitHub 上编辑此页面",
    notFound: [
      "糟糕！这个页面不存在。",
      "无",
      "抱歉，这里还不存在内容。",
      "Error 404/ 页面不存在，但一只小可爱替代了他~",
      "回家吧，回到最初的美好。",
    ],
    backToHome: "回到首页",
    navbar: [
      { text: "指南", link: "/zh/guide/" },
      {
        text: "学习",
        children: [
          {
            text: "指南",
            children: [
              {
                text: "概览",
                link: "/zh/guide/",
                activeMatch: "^/zh/guide/$",
              },
              {
                text: "介绍",
                link: "/zh/guide/introduction.html",
              },
              {
                text: "入门",
                link: "/zh/guide/getting-started.html",
              },
              {
                text: "发送和接收消息",
                link: "/zh/guide/basics.html",
              },
              {
                text: "上下文",
                link: "/zh/guide/context.html",
              },
              {
                text: "Bot API",
                link: "/zh/guide/api.html",
              },
              {
                text: "Filter 查询和 bot.on()",
                link: "/zh/guide/filter-queries.html",
              },
              {
                text: "命令",
                link: "/zh/guide/commands.html",
              },
              {
                text: "中间件",
                link: "/zh/guide/middleware.html",
              },
              {
                text: "错误处理",
                link: "/zh/guide/errors.html",
              },
              {
                text: "Inline Queries",
                link: "/zh/guide/inline-queries.html",
              },
              {
                text: "文件管理",
                link: "/zh/guide/files.html",
              },
              {
                text: "游戏",
                link: "/zh/guide/games.html",
              },
              {
                text: "长轮询 vs. Webhooks",
                link: "/zh/guide/deployment-types.html",
              },
            ],
          },
          {
            text: "进阶",
            children: [
              {
                text: "概览",
                link: "/zh/advanced/",
                activeMatch: "^/zh/advanced/$",
              },
              {
                text: "重构中间件",
                link: "/zh/advanced/middleware.html",
              },
              {
                text: "I: 代码组织",
                link: "/zh/advanced/structuring.html",
              },
              {
                text: "II: 高负载",
                link: "/zh/advanced/scaling.html",
              },
              {
                text: "III: 可靠性",
                link: "/zh/advanced/reliability.html",
              },
              {
                text: "IV: 流量限制",
                link: "/zh/advanced/flood.html",
              },
              {
                text: "Bot API Transformers",
                link: "/zh/advanced/transformers.html",
              },
              {
                text: "支持",
                link: "/zh/advanced/proxy.html",
              },
              {
                text: "部署检查清单",
                link: "/zh/advanced/deployment.html",
              },
            ],
          },
        ],
      },
      {
        text: "插件",
        children: [
          {
            text: "介绍",
            children: [
              {
                text: "关于插件",
                link: "/zh/plugins/",
                activeMatch: "^/zh/plugins/$",
              },
              {
                text: "如何编写插件",
                link: "/zh/plugins/guide.html",
              },
            ],
          },
          {
            text: "内置插件",
            children: [
              {
                text: "会话与数据储存",
                link: "/zh/plugins/session.html",
              },
              {
                text: "Inline 与自定义 Keyboards",
                link: "/zh/plugins/keyboard.html",
              },
            ],
          },
          {
            text: "官方插件",
            children: [
              {
                text: "对话 (conversations)",
                link: "/zh/plugins/conversations.html",
              },
              {
                text: "互动菜单 (menu)",
                link: "/zh/plugins/menu.html",
              },
              {
                text: "无状态问题 (stateless-question)",
                link: "/zh/plugins/stateless-question.html",
              },
              {
                text: "并发 (runner)",
                link: "/zh/plugins/runner.html",
              },
              {
                text: "Hydration (hydrate)",
                link: "/zh/plugins/hydrate.html",
              },
              {
                text: "重试 API 请求 (auto-retry)",
                link: "/zh/plugins/auto-retry.html",
              },
              {
                text: "流量控制 (transformer-throttler)",
                link: "/zh/plugins/transformer-throttler.html",
              },
              {
                text: "流量控制 (ratelimiter)",
                link: "/zh/plugins/ratelimiter.html",
              },
              {
                text: "文件助手 (files)",
                link: "/zh/plugins/files.html",
              },
              {
                text: "国际化 (i18n)",
                link: "/zh/plugins/i18n.html",
              },
              {
                text: "国际化 (fluent)",
                link: "/zh/plugins/fluent.html",
              },
              {
                text: "路由器 (router)",
                link: "/zh/plugins/router.html",
              },
              {
                text: "Emoji (emoji)",
                link: "/zh/plugins/emoji.html",
              },
              {
                text: "解析模式 (parse-mode)",
                link: "/zh/plugins/parse-mode.html",
              },
            ],
          },
          {
            text: "第三方插件",
            children: [
              {
                text: "调试时输出日志",
                link: "/zh/plugins/console-time.html",
              },
              {
                text: "有用的中间件",
                link: "/zh/plugins/middlewares.html",
              },
              {
                text: "自动引用",
                link: "/zh/plugins/autoquote.html",
              },
              {
                text: "[提交你的 PR!]",
                link: "/zh/plugins/#create-your-own-plugins",
              },
            ],
          },
        ],
      },
      {
        text: "示例",
        children: [
          {
            text: "示例",
            children: [
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
        children: [
          {
            text: "grammY",
            children: [
              {
                text: "关于 grammY",
                link: "/zh/resources/about.html",
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
                link: "/zh/resources/faq.html",
              },
              {
                text: "与其他框架的比较",
                link: "/zh/resources/comparison.html",
              },
            ],
          },
          {
            text: "Telegram",
            children: [
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
          },
        ],
      },
      {
        text: "托管服务",
        children: [
          {
            text: "概览",
            children: [
              {
                text: "对比",
                link: "/zh/hosting/comparison.html",
              },
            ],
          },
          {
            text: "教程",
            children: [
              {
                text: "Deno Deploy",
                link: "/zh/hosting/deno-deploy.html",
              },
              {
                text: "Supabase Edge Functions",
                link: "/zh/hosting/supabase.html",
              },
              {
                text: "Cloudflare Workers",
                link: "/zh/hosting/cloudflare-workers.html",
              },
              {
                text: "Heroku",
                link: "/zh/hosting/heroku.html",
              },
              {
                text: "Fly",
                link: "/zh/hosting/fly.html",
              },
              {
                text: "Google Cloud Functions",
                link: "/zh/hosting/gcf.html",
              },
              {
                text: "Vercel",
                link: "/zh/hosting/vercel.html",
              },
              {
                text: "Virtual Private Server",
                link: "/zh/hosting/vps.html",
              },
            ],
          },
        ],
      },
      {
        text: "API 参考",
        link: "https://deno.land/x/grammy/mod.ts",
      },
    ],
  },
};

export const docsearchZh: LocaleConfig<DocsearchLocaleData> = {
  "/zh": {
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
