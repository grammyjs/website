import { defaultTheme, defineUserConfig } from "vuepress-vite";
import { betterLineBreaks } from "./plugins/better-line-breaks";
import { docsearch } from "./plugins/docsearch";

export default defineUserConfig({
  title: "grammY",
  description: "The Telegram Bot Framework.",

  locales: {
    "/": {
      lang: "en-US",
      title: "grammY",
      description: "The Telegram Bot Framework.",
    },
    "/es/": {
      lang: "es-ES",
      title: "grammY",
      description: "El Framework de Bots para Telegram.",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "grammY",
      description: "Telegram Bot 框架",
    },
  },
  shouldPrefetch: true,

  theme: defaultTheme({
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
                    text: "Getting Started",
                    link: "/guide/getting-started.md",
                  },
                  {
                    text: "Sending and Receiving Messages",
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
                    text: "Filter Queries and bot.on()",
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
                    text: "Error Handling",
                    link: "/guide/errors.md",
                  },
                  {
                    text: "Inline Queries",
                    link: "/guide/inline-queries.md",
                  },
                  {
                    text: "File Handling",
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
                    text: "Middleware Redux",
                    link: "/advanced/middleware.md",
                  },
                  {
                    text: "Scaling Up I: Large Codebase",
                    link: "/advanced/structuring.md",
                  },
                  {
                    text: "Scaling Up II: High Load",
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
                  {
                    text: "How to Write a Plugin",
                    link: "/plugins/guide.md",
                  },
                ],
              },
              {
                text: "Built-in",
                children: [
                  {
                    text: "Sessions and Storing Data",
                    link: "/plugins/session.md",
                  },
                  {
                    text: "Inline and Custom Keyboards",
                    link: "/plugins/keyboard.md",
                  },
                ],
              },
              {
                text: "Official",
                children: [
                  {
                    text: "Interactive Menus (menu)",
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
                    text: "Retry API Requests (auto-retry)",
                    link: "/plugins/auto-retry.md",
                  },
                  {
                    text: "Flood Control (transformer-throttler)",
                    link: "/plugins/transformer-throttler.md",
                  },
                  {
                    text: "Rate Limit Users (ratelimiter)",
                    link: "/plugins/ratelimiter.md",
                  },
                  {
                    text: "Files (files)",
                    link: "/plugins/files.md",
                  },
                  {
                    text: "Internationalization (fluent)",
                    link: "/plugins/fluent.md",
                  },
                  {
                    text: "Router (router)",
                    link: "/plugins/router.md",
                  },
                  {
                    text: "Emoji (emoji)",
                    link: "/plugins/emoji.md",
                  },
                  {
                    text: "Parse Mode (parse-mode)",
                    link: "/plugins/parse-mode.md",
                  },
                  {
                    text: "Command Filtering (command-filter)",
                    link: "/plugins/command-filter.md",
                  },
                ],
              },
              {
                text: "Third-party",
                children: [
                  {
                    text: "Console Time",
                    link: "/plugins/console-time.md",
                  },
                  {
                    text: "Useful Middleware",
                    link: "/plugins/middlewares.md",
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
                    text: "Awesome grammY",
                    link: "https://github.com/grammyjs/awesome-grammY",
                  },
                  {
                    text: "Example Bots Repository",
                    link: "https://github.com/grammyjs/examples",
                  },
                  {
                    text: "Live Browser Demo",
                    link: "/demo/README.md",
                  },
                  { text: "Example Bots", link: "/demo/examples.md" },
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
                    link: "/resources/about.md",
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
                    link: "/resources/faq.md",
                  },
                  {
                    text: "Comparison to Other Frameworks",
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
                  {
                    text: "Example Updates",
                    link:
                      "https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates",
                  },
                ],
              },
              {
                text: "Hosting",
                children: [
                  {
                    text: "Deno Deploy",
                    link: "/hosting/deno-deploy.md",
                  },
                  {
                    text: "Heroku",
                    link: "/hosting/heroku.md",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/hosting/gcf.md",
                  },
                  {
                    text: "Virtual Private Server",
                    link: "/hosting/vps.md",
                  },
                ],
              },
            ],
          },
          {
            text: "API Reference",
            link: "https://doc.deno.land/https://deno.land/x/grammy/mod.ts",
          },
        ],
      },
      "/es/": {
        selectLanguageName: "Español",
        editLinkText: "Editar esta página en GitHub",
        contributorsText: "Colaboradores",
        lastUpdatedText: "Última actualización",
        notFound: [
          "¡Uy! Esta página no existe",
          "Nop.",
          "Nada aquí para ti, lo siento",
          "Error 404/ ¡Houston, tenemos un problema!",
          "Vuelveeeee, vuelve a casaaaaa, por navidad",
        ],
        backToHome: "Llévame a casa",
        navbar: [
          { text: "Guía", link: "/es/guide/" },
          {
            text: "Aprender",
            children: [
              {
                text: "Guía",
                children: [
                  {
                    text: "Resumen",
                    link: "/es/guide/README.md",
                  },
                  {
                    text: "Introducción",
                    link: "/es/guide/introduction.md",
                  },
                  {
                    text: "Cómo empezar",
                    link: "/es/guide/getting-started.md",
                  },
                  {
                    text: "Envío y recepción de mensajes",
                    link: "/es/guide/basics.md",
                  },
                  {
                    text: "Contexto",
                    link: "/es/guide/context.md",
                  },
                  {
                    text: "API para bots",
                    link: "/es/guide/api.md",
                  },
                  {
                    text: "Filtrar consultas y bot.on()",
                    link: "/es/guide/filter-queries.md",
                  },
                  {
                    text: "Comandos",
                    link: "/es/guide/commands.md",
                  },
                  {
                    text: "Middleware",
                    link: "/es/guide/middleware.md",
                  },
                  {
                    text: "Manejo de errores",
                    link: "/es/guide/errors.md",
                  },
                  {
                    text: "Consultas lineales",
                    link: "/es/guide/inline-queries.md",
                  },
                  {
                    text: "Manejo de archivos",
                    link: "/es/guide/files.md",
                  },
                  {
                    text: "Juegos",
                    link: "/es/guide/games.md",
                  },
                  {
                    text: "Long Polling frente a Webhooks",
                    link: "/es/guide/deployment-types.md",
                  },
                ],
              },
              {
                text: "Avanzado",
                children: [
                  {
                    text: "Resumen",
                    link: "/es/advanced/README.md",
                  },
                  {
                    text: "Middleware en profundidad",
                    link: "/es/advanced/middleware.md",
                  },
                  {
                    text: "Escalando I: Código base grande",
                    link: "/es/advanced/structuring.md",
                  },
                  {
                    text: "Escalando II: Alta carga",
                    link: "/es/advanced/scaling.md",
                  },
                  {
                    text: "Escalando III: Fiabilidad",
                    link: "/es/advanced/reliability.md",
                  },
                  {
                    text: "Escalando IV: Límites de flujo",
                    link: "/es/advanced/flood.md",
                  },
                  {
                    text: "Transformadores de la API del Bot",
                    link: "/es/advanced/transformers.md",
                  },
                  {
                    text: "Soporte para proxy",
                    link: "/es/advanced/proxy.md",
                  },
                  {
                    text: "Lista de comprobación del despliegue",
                    link: "/es/advanced/deployment.md",
                  },
                ],
              },
            ],
          },
          {
            text: "Complementos",
            children: [
              {
                text: "Introducción",
                children: [
                  {
                    text: "Acerca de los complementos",
                    link: "/es/plugins/README.md",
                  },
                  {
                    text: "Cómo escribir complementos",
                    link: "/es/plugins/guide.md",
                  },
                ],
              },
              {
                text: "Incorporado",
                children: [
                  {
                    text: "Sesiones y almacenamiento de datos",
                    link: "/es/plugins/session.md",
                  },
                  {
                    text: "Teclados lineales y personalizados",
                    link: "/es/plugins/keyboard.md",
                  },
                ],
              },
              {
                text: "Oficial",
                children: [
                  {
                    text: "Menus Interactivos (menu)",
                    link: "/es/plugins/menu.md",
                  },
                  {
                    text: "Conversaciones (conversations)",
                    link: "/es/plugins/conversations.md",
                  },
                  {
                    text: "Preguntas sin estado (stateless-question)",
                    link: "/es/plugins/stateless-question.md",
                  },
                  {
                    text: "Concurrencia (runner)",
                    link: "/es/plugins/runner.md",
                  },
                  {
                    text: "Hidratación (hydrate)",
                    link: "/es/plugins/hydrate.md",
                  },
                  {
                    text: "Reintentar solicitudes de la API (auto-retry)",
                    link: "/es/plugins/auto-retry.md",
                  },
                  {
                    text: "Control de flujo (transformer-throttler)",
                    link: "/es/plugins/transformer-throttler.md",
                  },
                  {
                    text: "Usuarios con límite de peticiones (ratelimiter)",
                    link: "/es/plugins/ratelimiter.md",
                  },
                  {
                    text: "Archivos (files)",
                    link: "/es/plugins/files.md",
                  },
                  {
                    text: "Internacionalización (fluent)",
                    link: "/es/plugins/fluent.md",
                  },
                  {
                    text: "Enrutador (router)",
                    link: "/es/plugins/router.md",
                  },
                  {
                    text: "Emojis (emoji)",
                    link: "/es/plugins/emoji.md",
                  },
                  {
                    text: "Modo de parsear (parse-mode)",
                    link: "/es/plugins/parse-mode.md",
                  },
                  {
                    text: "Filtro de comandos (command-filter)",
                    link: "/es/plugins/command-filter.md",
                  },
                ],
              },
              {
                text: "De Terceros",
                children: [
                  {
                    text: "Tiempo de consola",
                    link: "/es/plugins/console-time.md",
                  },
                  {
                    text: "Middleware útil",
                    link: "/es/plugins/middlewares.md",
                  },
                  {
                    text: "[¡Envíe su PR!]",
                    link:
                      "/es/plugins/README.md#submitting-your-own-package-to-the-docs",
                  },
                ],
              },
            ],
          },
          {
            text: "Ejemplos",
            children: [
              {
                text: "Ejemplos",
                children: [
                  {
                    text: "Impresionante grammY",
                    link: "https://github.com/grammyjs/awesome-grammY",
                  },
                  {
                    text: "Ejemplo de Repositorio de Bots",
                    link: "https://github.com/grammyjs/examples",
                  },
                  {
                    text: "Demostración de navegador en vivo",
                    link: "/es/demo/README.md",
                  },
                  {
                    text: "Ejemplos de bots",
                    link: "/es/demo/examples.md",
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
                    text: "Sobre grammY",
                    link: "/es/resources/about.md",
                  },
                  {
                    text: "Chat comunitario (Inglés)",
                    link: "https://t.me/grammyjs",
                  },
                  {
                    text: "Chat comunitario (Ruso)",
                    link: "https://t.me/grammyjs_ru",
                  },
                  {
                    text: "Noticias",
                    link: "https://t.me/grammyjs_news",
                  },
                  {
                    text: "Twitter",
                    link: "https://twitter.com/grammy_js",
                  },
                  {
                    text: "Preguntas frecuentes",
                    link: "/es/resources/faq.md",
                  },
                  {
                    text: "Comparación con otros frameworks",
                    link: "/es/resources/comparison.md",
                  },
                ],
              },
              {
                text: "Telegram",
                children: [
                  {
                    text: "Introducción para desarrolladores",
                    link: "https://core.telegram.org/bots",
                  },
                  {
                    text: "Preguntas frecuentes de bots",
                    link: "https://core.telegram.org/bots/faq",
                  },
                  {
                    text: "Referencia de la API para bots",
                    link: "https://core.telegram.org/bots/api",
                  },
                  {
                    text: "Ejemplos de actualizaciones",
                    link:
                      "https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates",
                  },
                ],
              },
              {
                text: "Alojamiento",
                children: [
                  {
                    text: "Despliegue con Deno",
                    link: "/es/hosting/deno-deploy.md",
                  },
                  {
                    text: "Heroku",
                    link: "/es/hosting/heroku.md",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/es/hosting/gcf.md",
                  },
                  {
                    text: "Servidor Privado Virtual",
                    link: "/es/hosting/vps.md",
                  },
                ],
              },
            ],
          },
          {
            text: "Referencia de API",
            link: "https://doc.deno.land/https://deno.land/x/grammy/mod.ts",
          },
        ],
      },
      "/zh/": {
        selectLanguageText: "语言",
        selectLanguageName: "简体中文",
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
                    text: "Filter 查询与 bot.on()",
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
                    text: "错误处理",
                    link: "/zh/guide/errors.md",
                  },
                  {
                    text: "Inline Queries",
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
                    text: "I: 代码组织",
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
                    text: "IV: 流量限制",
                    link: "/zh/advanced/flood.md",
                  },
                  {
                    text: "Bot API Transformers",
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
                  {
                    text: "如何编写一个插件",
                    link: "/zh/plugins/guide.md",
                  },
                ],
              },
              {
                text: "内置插件",
                children: [
                  {
                    text: "会话与数据储存",
                    link: "/zh/plugins/session.md",
                  },
                  {
                    text: "Inline 与自定义 Keyboards",
                    link: "/zh/plugins/keyboard.md",
                  },
                ],
              },
              {
                text: "官方维护",
                children: [
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
                    text: "重试 API 请求 (auto-retry)",
                    link: "/zh/plugins/auto-retry.md",
                  },
                  {
                    text: "流量控制 (transformer-throttler)",
                    link: "/zh/plugins/transformer-throttler.md",
                  },
                  {
                    text: "限制用户速率 (ratelimiter)",
                    link: "/zh/plugins/ratelimiter.md",
                  },
                  {
                    text: "文件助手 (files)",
                    link: "/zh/plugins/files.md",
                  },
                  {
                    text: "国际化 (fluent)",
                    link: "/zh/plugins/fluent.md",
                  },
                  {
                    text: "路由器 (router)",
                    link: "/zh/plugins/router.md",
                  },
                  {
                    text: "Emoji (emoji)",
                    link: "/zh/plugins/emoji.md",
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
                    text: "调试时输出日志",
                    link: "/zh/plugins/console-time.md",
                  },
                  {
                    text: "有用的中间件",
                    link: "/zh/plugins/middlewares.md",
                  },
                  {
                    text: "[等待你的 PR!]",
                    link: "/zh/plugins/README.md#向文档提交你自己的插件",
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
                  {
                    text: "在线 Demo",
                    link: "/zh/demo/README.md",
                  },
                  {
                    text: "示例 Bots",
                    link: "/zh/demo/examples.md",
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
                    link: "/zh/resources/about.md",
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
                    text: "咨询",
                    link: "https://t.me/grammyjs_news",
                  },
                  {
                    text: "Twitter",
                    link: "https://twitter.com/grammy_js",
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
                    text: "Bot API 概览",
                    link: "https://core.telegram.org/bots/api",
                  },
                  {
                    text: "Updates 示例",
                    link:
                      "https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates",
                  },
                ],
              },
              {
                text: "托管服务",
                children: [
                  {
                    text: "Deno Deploy",
                    link: "/zh/hosting/deno-deploy.md",
                  },
                  {
                    text: "Heroku",
                    link: "/zh/hosting/heroku.md",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/zh/hosting/gcf.md",
                  },
                  {
                    text: "Virtual Private Server",
                    link: "/zh/hosting/vps.md",
                  },
                ],
              },
            ],
          },
          {
            text: "API 参考",
            link: "https://doc.deno.land/https://deno.land/x/grammy/mod.ts",
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
  }),
  plugins: [
    docsearch({
      "/es/": {
        placeholder: "Buscar",
        translations: { button: { buttonText: "Buscar" } },
      },
      "/zh/": {
        placeholder: "搜索文档",
        translations: { button: { buttonText: "搜索文档" } },
      },
    }),
    betterLineBreaks(),
  ],
  markdown: {
    typographer: true,
  },
});
