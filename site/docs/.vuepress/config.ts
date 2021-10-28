import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";

export default defineUserConfig<DefaultThemeOptions>({
  title: "grammY",
  description: "The Telegram Bot Framework.",

  locales: {
    "/": {
      lang: "en-US",
      title: "grammY",
      description: "The Telegram Bot Framework.",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "grammY",
      description: "Telegram Bot 框架",
    },
    "/pt/": {
      lang: "pt-BR",
      title: "grammY",
      description: "O Framework de Bots para Telegram",
    },
  },
  shouldPrefetch: true,

  themeConfig: {
    logo: "/Y.png",
    locales: {
      "/": {
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
                    text: "Games",
                    link: "/guide/games.md",
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
                    text: "Scaling Up IV: Flood Limits",
                    link: "/advanced/flood.md",
                  },
                  {
                    text: "Bot API Transformers",
                    link: "/advanced/transformers.md",
                  },
                  {
                    text: "Proxy Support",
                    link: "/advanced/proxy.md",
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
                    text: "Interactive menus (menu)",
                    link: "/plugins/menu.md",
                  },
                  {
                    text: "Stateless Question (stateless-question)",
                    link: "/plugins/stateless-question.md",
                  },
                  {
                    text: "Concurrency (runner)",
                    link: "/plugins/runner.md",
                  },
                  {
                    text: "Hydration (hydrate)",
                    link: "/plugins/hydrate.md",
                  },
                  {
                    text: "Retry API requests (auto-retry)",
                    link: "/plugins/auto-retry.md",
                  },
                  {
                    text: "Flood control (transformer-throttler)",
                    link: "/plugins/transformer-throttler.md",
                  },
                  {
                    text: "Rate limit users (ratelimiter)",
                    link: "/plugins/ratelimiter.md",
                  },
                  {
                    text: "Files (files)",
                    link: "/plugins/files.md",
                  },
                  {
                    text: "Internationalization (i18n)",
                    link: "/plugins/i18n.md",
                  },
                  {
                    text: "Router (router)",
                    link: "/plugins/router.md",
                  },
                  {
                    text: "Parse Mode (parse-mode)",
                    link: "/plugins/parse-mode.md",
                  },
                  {
                    text: "Command filtering (command-fiter)",
                    link: "/plugins/command-filter.md",
                  },
                ],
              },
              {
                text: "Third-party",
                children: [
                  {
                    text: "Console time",
                    link: "/plugins/console-time.md",
                  },
                  {
                    text: "[Submit your PR!]",
                    link:
                      "/plugins/README.md#submitting-your-own-package-to-the-docs",
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
                    text: "Example Bots Repository",
                    link: "https://github.com/grammyjs/examples",
                  },
                  {
                    text: "Live Browser Demo",
                    link: "/demo/README.md",
                  },
                  { text: "Example Bots", link: "/demo/examples.md" },
                  {
                    text: "Community Showlounge",
                    link: "/demo/showlounge.md",
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
                    text: "Community Chat",
                    link: "https://t.me/grammyjs",
                  },
                  {
                    text: "Awesome grammY",
                    link: "https://github.com/grammyjs/awesome-grammY",
                  },
                  {
                    text: "News",
                    link: "https://t.me/grammyjs_news",
                  },
                  {
                    text: "FAQ",
                    link: "/resources/faq.md",
                  },
                  {
                    text: "Comparison to other frameworks",
                    link: "/resources/comparison.md",
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
                    text: "Heroku",
                    link: "/hosting/heroku.md",
                  },
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
      "/zh/": {
        selectLanguageText: "语言",
        selectLanguageName: "简体中文",
        editLinks: true,
        editLinkText: "在 GitHub 上编辑此页！",
        contributorsText: "贡献者",
        lastUpdatedText: "最近更新时间",
        notFound: [
          "糟糕！这个页面不存在。",
          "无",
          "抱歉，这里还不存在内容。",
          "Error 404/ 页面不存在，但一只小可爱替代了他~",
          "回家吧，回到最初的美好。",
        ],
        backToHome: "回到首页",
        navbar: [
          { text: "基础", link: "/zh/guide/" },
          {
            text: "了解",
            children: [
              {
                text: "基础",
                children: [
                  {
                    text: "概述",
                    link: "/zh/guide/README.md",
                  },
                  {
                    text: "简介",
                    link: "/zh/guide/introduction.md",
                  },
                  {
                    text: "入门",
                    link: "/zh/guide/getting-started.md",
                  },
                  {
                    text: "发送和接收消息",
                    link: "/zh/guide/basics.md",
                  },
                  {
                    text: "上下文",
                    link: "/zh/guide/context.md",
                  },
                  {
                    text: "Bot API",
                    link: "/zh/guide/api.md",
                  },
                  {
                    text: "过滤式查询与 bot.on()",
                    link: "/zh/guide/filter-queries.md",
                  },
                  {
                    text: "Commands",
                    link: "/zh/guide/commands.md",
                  },
                  {
                    text: "中间件",
                    link: "/zh/guide/middleware.md",
                  },
                  {
                    text: "错误捕获",
                    link: "/zh/guide/errors.md",
                  },
                  {
                    text: "内联查询",
                    link: "/zh/guide/inline-queries.md",
                  },
                  {
                    text: "文件管理",
                    link: "/zh/guide/files.md",
                  },
                  {
                    text: "游戏",
                    link: "/zh/guide/games.md",
                  },
                  {
                    text: "长轮询 vs. Webhooks",
                    link: "/zh/guide/deployment-types.md",
                  },
                ],
              },
              {
                text: "进阶",
                children: [
                  {
                    text: "概述",
                    link: "/zh/advanced/README.md",
                  },
                  {
                    text: "重构中间件",
                    link: "/zh/advanced/middleware.md",
                  },
                  {
                    text: "I: 巨量的代码",
                    link: "/zh/advanced/structuring.md",
                  },
                  {
                    text: "II: 高负载",
                    link: "/zh/advanced/scaling.md",
                  },
                  {
                    text: "III: 可靠性",
                    link: "/zh/advanced/reliability.md",
                  },
                  {
                    text: "IV: 极限控制",
                    link: "/zh/advanced/flood.md",
                  },
                  {
                    text: "可定制的 Bot API",
                    link: "/zh/advanced/transformers.md",
                  },
                  {
                    text: "代理支持",
                    link: "/zh/advanced/proxy.md",
                  },
                  {
                    text: "部署",
                    link: "/zh/advanced/deployment.md",
                  },
                ],
              },
            ],
          },
          {
            text: "插件",
            children: [
              {
                text: "简介",
                children: [
                  {
                    text: "关于插件",
                    link: "/zh/plugins/README.md",
                  },
                ],
              },
              {
                text: "官方维护",
                children: [
                  {
                    text: "会话与数据储存（内置）",
                    link: "/zh/plugins/session.md",
                  },
                  {
                    text: "按键与内联式按键（内置）",
                    link: "/zh/plugins/keyboard.md",
                  },
                  {
                    text: "互动菜单（menu）",
                    link: "/zh/plugins/menu.md",
                  },
                  {
                    text: "无状态问题 (stateless-question)",
                    link: "/zh/plugins/stateless-question.md",
                  },
                  {
                    text: "并发 (runner)",
                    link: "/zh/plugins/runner.md",
                  },
                  {
                    text: "Hydration (hydrate)",
                    link: "/zh/plugins/hydrate.md",
                  },
                  {
                    text: "可重试的 API 请求 (auto-retry)",
                    link: "/zh/plugins/auto-retry.md",
                  },
                  {
                    text: "顶峰控制 (transformer-throttler)",
                    link: "/zh/plugins/transformer-throttler.md",
                  },
                  {
                    text: "用户守卫 (ratelimiter)",
                    link: "/zh/plugins/ratelimiter.md",
                  },
                  {
                    text: "文件助手 (files)",
                    link: "/zh/plugins/files.md",
                  },
                  {
                    text: "国际化 (i18n)",
                    link: "/zh/plugins/i18n.md",
                  },
                  {
                    text: "路由 (router)",
                    link: "/zh/plugins/router.md",
                  },
                  {
                    text: "解析模式 (parse-mode)",
                    link: "/zh/plugins/parse-mode.md",
                  },
                  {
                    text: "指令过滤 (command-fiter)",
                    link: "/zh/plugins/command-filter.md",
                  },
                ],
              },
              {
                text: "第三方",
                children: [
                  {
                    text: "Console time",
                    link: "/zh/plugins/console-time.md",
                  },
                  {
                    text: "[等待你的 PR!]",
                    link:
                      "/plugins/README.md#submitting-your-own-package-to-the-docs",
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
                    text: "示例 Bots 仓库",
                    link: "/zh/ttps://github.com/grammyjs/examples",
                  },
                  {
                    text: "在线 Demo",
                    link: "/zh/demo/README.md",
                  },
                  {
                    text: "示例 Bots",
                    link: "/zh/demo/examples.md",
                  },
                  {
                    text: "社区示例",
                    link: "/zh/demo/showlounge.md",
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
                    text: "社区聊天",
                    link: "/zh/ttps://t.me/grammyjs",
                  },
                  {
                    text: "Awesome grammY",
                    link: "/zh/ttps://github.com/grammyjs/awesome-grammY",
                  },
                  {
                    text: "咨询",
                    link: "/zh/ttps://t.me/grammyjs_news",
                  },
                  {
                    text: "FAQ",
                    link: "/zh/resources/faq.md",
                  },
                  {
                    text: "与其他框架的比较",
                    link: "/zh/resources/comparison.md",
                  },
                ],
              },
              {
                text: "TODO translate Telegram",
                children: [
                  {
                    text: "面向开发者的介绍",
                    link: "/zh/ttps://core.telegram.org/bots",
                  },
                  {
                    text: "Bots FAQ",
                    link: "/zh/ttps://core.telegram.org/bots/faq",
                  },
                  {
                    text: "Bot API 概览",
                    link: "/zh/ttps://core.telegram.org/bots/api",
                  },
                ],
              },
              {
                text: "托管服务",
                children: [
                  {
                    text: "Heroku",
                    link: "/zh/hosting/heroku.md",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/zh/hosting/gcf.md",
                  },
                ],
              },
            ],
          },
          {
            text: "API 参考",
            link: "https://doc.deno.land/https/deno.land/x/grammy/mod.ts",
          },
        ],
      },
      "/pt/": {
        selectLanguageText: "Linguagem",
        selectLanguageName: "Português do Brasil",
        editLinks: true,
        editLinkText: "Edite essa página no GitHub",
        notFound: [
          "Não encontrado",
          "Não.",
          "Não tem nada aqui para você, desculpe",
          "Erro 404/ Essa página não pôde ser encontrada",
          "Eu vou, eu vou,",
        ],
        backToHome: "Para a casa agora eu vou",
        navbar: [
          { text: "Guia", link: "/pt/guide/" },
          {
            text: "Aprenda",
            children: [
              {
                text: "Guia",
                children: [
                  {
                    text: "Visão geral",
                    link: "/pt/guide/README.md",
                  },
                  {
                    text: "Introdução",
                    link: "/pt/guide/introduction.md",
                  },
                  {
                    text: "Começando",
                    link: "/pt/guide/getting-started.md",
                  },
                  {
                    text: "Enviando e recebendo mensagens",
                    link: "/pt/guide/basics.md",
                  },
                  {
                    text: "Contexto",
                    link: "/pt/guide/context.md",
                  },
                  {
                    text: "API de Bots",
                    link: "/pt/guide/api.md",
                  },
                  {
                    text: "Filtragem de consultas e bot.on()",
                    link: "/pt/guide/filter-queries.md",
                  },
                  {
                    text: "Comandos",
                    link: "/pt/guide/commands.md",
                  },
                  {
                    text: "Middleware",
                    link: "/pt/guide/middleware.md",
                  },
                  {
                    text: "Manipulação de erros",
                    link: "/pt/guide/errors.md",
                  },
                  {
                    text: "Inline Queries",
                    link: "/pt/guide/inline-queries.md",
                  },
                  {
                    text: "Manipulação de arquivos",
                    link: "/pt/guide/files.md",
                  },
                  {
                    text: "Jogos",
                    link: "/pt/guide/games.md",
                  },
                  {
                    text: "Long Polling vs. Webhooks",
                    link: "/pt/guide/deployment-types.md",
                  },
                ],
              },
              {
                text: "Avançado",
                children: [
                  {
                    text: "Visão geral",
                    link: "/pt/advanced/README.md",
                  },
                  {
                    text: "Middleware redux",
                    link: "/pt/advanced/middleware.md",
                  },
                  {
                    text: "Escalando I: Base de código grande",
                    link: "/pt/advanced/structuring.md",
                  },
                  {
                    text: "Escalando II: Carga elevada",
                    link: "/pt/advanced/scaling.md",
                  },
                  {
                    text: "Escalando III: Confiabilidade",
                    link: "/pt/advanced/reliability.md",
                  },
                  {
                    text: "Escalando IV: Limites de flood",
                    link: "/pt/advanced/flood.md",
                  },
                  {
                    text: "Transformadores",
                    link: "/pt/advanced/transformers.md",
                  },
                  {
                    text: "Suporte a proxy",
                    link: "/pt/advanced/proxy.md",
                  },
                  {
                    text: "Lista de verificação de deploy",
                    link: "/pt/advanced/deployment.md",
                  },
                ],
              },
            ],
          },
          {
            text: "Plugins",
            children: [
              {
                text: "Introdução",
                children: [
                  {
                    text: "Sobre Plugins",
                    link: "/pt/plugins/README.md",
                  },
                ],
              },
              {
                text: "Oficial",
                children: [
                  {
                    text: "Sessões e armazenamento de dados (built-in)",
                    link: "/pt/plugins/session.md",
                  },
                  {
                    text: "Teclados e teclados imbutidos (built-in)",
                    link: "/pt/plugins/keyboard.md",
                  },
                  {
                    text: "Menus interativos (menu)",
                    link: "/pt/plugins/menu.md",
                  },
                  {
                    text: "Perguntas sem estado (stateless-question)",
                    link: "/pt/plugins/stateless-question.md",
                  },
                  {
                    text: "Concorrência (runner)",
                    link: "/pt/plugins/runner.md",
                  },
                  {
                    text: "Hidratação (hydrate)",
                    link: "/pt/plugins/hydrate.md",
                  },
                  {
                    text: "Repetição de requisições da API (auto-retry)",
                    link: "/pt/plugins/auto-retry.md",
                  },
                  {
                    text: "Controle de flood (transformer-throttler)",
                    link: "/pt/plugins/transformer-throttler.md",
                  },
                  {
                    text: "Limite de taxa de usuários (ratelimiter)",
                    link: "/pt/plugins/ratelimiter.md",
                  },
                  {
                    text: "Arquivos (files)",
                    link: "/pt/plugins/files.md",
                  },
                  {
                    text: "Internacionalização (i18n)",
                    link: "/pt/plugins/i18n.md",
                  },
                  {
                    text: "Roteador (router)",
                    link: "/pt/plugins/router.md",
                  },
                  {
                    text: "Modo de análise (parse-mode)",
                    link: "/pt/plugins/parse-mode.md",
                  },
                  {
                    text: "Filtro de comandos (command-fiter)",
                    link: "/pt/plugins/command-filter.md",
                  },
                ],
              },
              {
                text: "Terceiros",
                children: [
                  {
                    text: "Console time",
                    link: "/pt/plugins/console-time.md",
                  },
                  {
                    text: "[Envie o seu PR!]",
                    link:
                      "/plugins/README.md#submitting-your-own-package-to-the-docs",
                  },
                ],
              },
            ],
          },
          {
            text: "Exemplos",
            children: [
              {
                text: "Examplos",
                children: [
                  {
                    text: "Repositório de exemplos",
                    link: "https://github.com/grammyjs/examples",
                  },
                  {
                    text: "Demonstração no navegador",
                    link: "/pt/demo/README.md",
                  },
                  { text: "Bots de exemplo", link: "/pt/demo/examples.md" },
                  {
                    text: "Projetos da comunidade",
                    link: "/pt/demo/showlounge.md",
                  },
                ],
              },
            ],
          },
          {
            text: "Recursos",
            children: [
              {
                text: "grammY",
                children: [
                  {
                    text: "Chat da comunidade",
                    link: "https://t.me/grammyjs",
                  },
                  {
                    text: "Awesome grammY",
                    link: "https://github.com/grammyjs/awesome-grammY",
                  },
                  {
                    text: "Notícias",
                    link: "https://t.me/grammyjs_news",
                  },
                  {
                    text: "FAQ",
                    link: "/pt/resources/faq.md",
                  },
                  {
                    text: "Comparação com outros frameworks",
                    link: "/pt/resources/comparison.md",
                  },
                ],
              },
              {
                text: "Telegram",
                children: [
                  {
                    text: "Introdução para desenvolvedores",
                    link: "https://core.telegram.org/bots",
                  },
                  {
                    text: "FAQ da API de bots",
                    link: "https://core.telegram.org/bots/faq",
                  },
                  {
                    text: "Referência da API de bots",
                    link: "https://core.telegram.org/bots/api",
                  },
                ],
              },
              {
                text: "Hospedagem",
                children: [
                  {
                    text: "Heroku",
                    link: "/pt/hosting/heroku.md",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/pt/hosting/gcf.md",
                  },
                ],
              },
            ],
          },
          {
            text: "Referência da API",
            link: "https://doc.deno.land/https/deno.land/x/grammy/mod.ts",
          },
        ],
      },
    },
    repo: "https://github.com/grammyjs/grammY",
    docsRepo: "https://github.com/grammyjs/website",
    docsDir: "site/docs",
    docsBranch: "main",
    editLink: true,
    editLinkPattern: ":repo/edit/:branch/:path",
    repoLabel: "GitHub",
  },
  plugins: [
    [
      "@vuepress/plugin-docsearch",
      {
        apiKey: "17b3527aa6f36e8d3fe2276b0f4d9633",
        indexName: "grammy",
        placeholder: "Search",
        locales: {
          "/zh/": { placeholder: "搜索文档" },
          "/pt/": { placeholder: "Pesquisar" },
        },
        sitemaps: ["https://grammy.dev/sitemap.xml"],
      },
    ],
    [
      {
        name: "break-long-inline-code-snippets",
        extendsMarkdown: (md) => {
          md.renderer.rules.code_inline = (
            tokens,
            idx,
            _opts,
            _env,
            slf,
          ) => {
            const token = tokens[idx];
            const attributes = slf.renderAttrs(token);
            const withBreaks = insertWbrTags(token.content);
            const escaped = escapeHtml(withBreaks);
            return `<code${attributes}>${escaped}</code>`;
          };
        },
      },
    ],
  ],
});

// Adapted from original `code_inline` implementation of markdown-it
const HTML_ESCAPE_TEST_RE = /&|<(?!wbr>)|(?<!<wbr)>/;
const HTML_ESCAPE_REPLACE_RE = /&|<(?!wbr>)|(?<!<wbr)>/g;
const HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};
function replaceUnsafeChar(ch: string) {
  return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str: string) {
  return HTML_ESCAPE_TEST_RE.test(str)
    ? str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)
    : str;
}

function insertWbrTags(url: string) {
  // Adapted from https://css-tricks.com/better-line-breaks-for-long-urls/
  return url
    .split("//")
    .map(
      (str) =>
        str
          // Insert a word break opportunity after a colon
          .replace(/(?<after>:)/giu, "$1<wbr>")
          // Before a single slash, tilde, period, comma, hyphen, underline, question mark, number sign, or percent symbol
          .replace(/(?<before>[/~.,\-_?#%])/giu, "<wbr>$1")
          // Before and after an equals sign or ampersand
          .replace(/(?<beforeAndAfter>[=&])/giu, "<wbr>$1<wbr>"),
    )
    // Reconnect the strings with word break opportunities after double slashes
    .join("//<wbr>");
}
