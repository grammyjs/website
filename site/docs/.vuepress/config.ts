import { defaultTheme, defineUserConfig } from "vuepress-vite";
import { betterLineBreaks } from "./plugins/better-line-breaks";
import { currentVersions } from "./plugins/current-versions/plugin";
import { docsearch } from "./plugins/docsearch";

export default defineUserConfig({
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
    "/id/": {
      lang: "id",
      title: "grammY",
      description: "Framework Bot Telegram.",
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
                    text: "Heroku",
                    link: "/hosting/heroku.html",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/hosting/gcf.html",
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
                    link: "/es/guide/",
                    activeMatch: "^/es/guide/$",
                  },
                  {
                    text: "Introducción",
                    link: "/es/guide/introduction.html",
                  },
                  {
                    text: "Cómo empezar",
                    link: "/es/guide/getting-started.html",
                  },
                  {
                    text: "Envío y recepción de mensajes",
                    link: "/es/guide/basics.html",
                  },
                  {
                    text: "Contexto",
                    link: "/es/guide/context.html",
                  },
                  {
                    text: "API para bots",
                    link: "/es/guide/api.html",
                  },
                  {
                    text: "Filtrar consultas y bot.on()",
                    link: "/es/guide/filter-queries.html",
                  },
                  {
                    text: "Comandos",
                    link: "/es/guide/commands.html",
                  },
                  {
                    text: "Middleware",
                    link: "/es/guide/middleware.html",
                  },
                  {
                    text: "Manejo de errores",
                    link: "/es/guide/errors.html",
                  },
                  {
                    text: "Consultas lineales",
                    link: "/es/guide/inline-queries.html",
                  },
                  {
                    text: "Manejo de archivos",
                    link: "/es/guide/files.html",
                  },
                  {
                    text: "Juegos",
                    link: "/es/guide/games.html",
                  },
                  {
                    text: "Long Polling frente a Webhooks",
                    link: "/es/guide/deployment-types.html",
                  },
                ],
              },
              {
                text: "Avanzado",
                children: [
                  {
                    text: "Resumen",
                    link: "/es/advanced/",
                    activeMatch: "^/es/advanced/$",
                  },
                  {
                    text: "Middleware en profundidad",
                    link: "/es/advanced/middleware.html",
                  },
                  {
                    text: "Escalando I: Código base grande",
                    link: "/es/advanced/structuring.html",
                  },
                  {
                    text: "Escalando II: Alta carga",
                    link: "/es/advanced/scaling.html",
                  },
                  {
                    text: "Escalando III: Fiabilidad",
                    link: "/es/advanced/reliability.html",
                  },
                  {
                    text: "Escalando IV: Límites de flujo",
                    link: "/es/advanced/flood.html",
                  },
                  {
                    text: "Transformadores de la API del Bot",
                    link: "/es/advanced/transformers.html",
                  },
                  {
                    text: "Soporte para proxy",
                    link: "/es/advanced/proxy.html",
                  },
                  {
                    text: "Lista de comprobación del despliegue",
                    link: "/es/advanced/deployment.html",
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
                    link: "/es/plugins/",
                    activeMatch: "^/es/plugins/$",
                  },
                  {
                    text: "Cómo escribir complementos",
                    link: "/es/plugins/guide.html",
                  },
                ],
              },
              {
                text: "Incorporado",
                children: [
                  {
                    text: "Sesiones y almacenamiento de datos",
                    link: "/es/plugins/session.html",
                  },
                  {
                    text: "Teclados lineales y personalizados",
                    link: "/es/plugins/keyboard.html",
                  },
                ],
              },
              {
                text: "Oficial",
                children: [
                  {
                    text: "Conversaciones (conversations)",
                    link: "/es/plugins/conversations.html",
                  },
                  {
                    text: "Menus Interactivos (menu)",
                    link: "/es/plugins/menu.html",
                  },
                  {
                    text: "Preguntas sin estado (stateless-question)",
                    link: "/es/plugins/stateless-question.html",
                  },
                  {
                    text: "Concurrencia (runner)",
                    link: "/es/plugins/runner.html",
                  },
                  {
                    text: "Hidratación (hydrate)",
                    link: "/es/plugins/hydrate.html",
                  },
                  {
                    text: "Reintentar solicitudes de la API (auto-retry)",
                    link: "/es/plugins/auto-retry.html",
                  },
                  {
                    text: "Control de flujo (transformer-throttler)",
                    link: "/es/plugins/transformer-throttler.html",
                  },
                  {
                    text: "Usuarios con límite de peticiones (ratelimiter)",
                    link: "/es/plugins/ratelimiter.html",
                  },
                  {
                    text: "Archivos (files)",
                    link: "/es/plugins/files.html",
                  },
                  {
                    text: "Internacionalización (i18n)",
                    link: "/es/plugins/i18n.html",
                  },
                  {
                    text: "Internacionalización (fluent)",
                    link: "/es/plugins/fluent.html",
                  },
                  {
                    text: "Enrutador (router)",
                    link: "/es/plugins/router.html",
                  },
                  {
                    text: "Emojis (emoji)",
                    link: "/es/plugins/emoji.html",
                  },
                  {
                    text: "Modo de parsear (parse-mode)",
                    link: "/es/plugins/parse-mode.html",
                  },
                ],
              },
              {
                text: "De Terceros",
                children: [
                  {
                    text: "Tiempo de consola",
                    link: "/es/plugins/console-time.html",
                  },
                  {
                    text: "Middlewares de utilidad",
                    link: "/es/plugins/middlewares.html",
                  },
                  {
                    text: "Citar automáticamente",
                    link: "/es/plugins/autoquote.html",
                  },
                  {
                    text: "[¡Envíe su PR!]",
                    link: "/es/plugins/#crear-tus-propios-plugins",
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
                    link: "/es/resources/about.html",
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
                    link: "/es/resources/faq.html",
                  },
                  {
                    text: "Comparación con otros frameworks",
                    link: "/es/resources/comparison.html",
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
            ],
          },
          {
            text: "Alojamiento",
            children: [
              {
                text: "Resumen",
                children: [
                  {
                    text: "Comparativa",
                    link: "/es/hosting/comparison.html",
                  },
                ],
              },
              {
                text: "Tutoriales",
                children: [
                  {
                    text: "Deno Deploy",
                    link: "/es/hosting/deno-deploy.html",
                  },
                  {
                    text: "Supabase Edge Functions",
                    link: "/es/hosting/supabase.html",
                  },
                  {
                    text: "Heroku",
                    link: "/es/hosting/heroku.html",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/es/hosting/gcf.html",
                  },
                  {
                    text: "Servidor Privado Virtual",
                    link: "/es/hosting/vps.html",
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
      "/id/": {
        selectLanguageText: "Bahasa",
        selectLanguageName: "Indonesia",
        editLinkText: "Edit halaman ini di GitHub",
        contributorsText: "Kontributor",
        lastUpdatedText: "Terakhir diperbarui",
        notFound: [
          "Halaman tidak ditemukan.",
          "Zonk!",
          "Maaf, tidak ada apa-apa di sini.",
          "Perjalanan ini... Terasa sangat menyedihkan~",
          "Hey, Google. Tunjukkan jalan ke halaman yang saya cari!",
          "Belum beruntung. Coba lagi.",
          "Pat nol pat peg not fon.",
        ],
        backToHome: "Putar balik, guys!",
        navbar: [
          { text: "Panduan", link: "/id/guide/" },
          {
            text: "Belajar",
            children: [
              {
                text: "Panduan",
                children: [
                  {
                    text: "Gambaran Umum",
                    link: "/id/guide/",
                    activeMatch: "^/id/guide/$",
                  },
                  {
                    text: "Pengenalan",
                    link: "/id/guide/introduction.html",
                  },
                  {
                    text: "Memulai",
                    link: "/id/guide/getting-started.html",
                  },
                  {
                    text: "Mengirim dan Menerima Pesan",
                    link: "/id/guide/basics.html",
                  },
                  {
                    text: "Context",
                    link: "/id/guide/context.html",
                  },
                  {
                    text: "API Bot",
                    link: "/id/guide/api.html",
                  },
                  {
                    text: "Filter Query dan bot.on()",
                    link: "/id/guide/filter-queries.html",
                  },
                  {
                    text: "Command",
                    link: "/id/guide/commands.html",
                  },
                  {
                    text: "Middleware",
                    link: "/id/guide/middleware.html",
                  },
                  {
                    text: "Menangani Error",
                    link: "/id/guide/errors.html",
                  },
                  {
                    text: "Inline Query",
                    link: "/id/guide/inline-queries.html",
                  },
                  {
                    text: "Menangani File",
                    link: "/id/guide/files.html",
                  },
                  {
                    text: "Game",
                    link: "/id/guide/games.html",
                  },
                  {
                    text: "Long Polling vs. Webhook",
                    link: "/id/guide/deployment-types.html",
                  },
                ],
              },
              {
                text: "Tingkat Lanjut",
                children: [
                  {
                    text: "Gambaran Umum",
                    link: "/id/advanced/",
                    activeMatch: "^/id/advanced/$",
                  },
                  {
                    text: "Membangkitkan Middleware",
                    link: "/id/advanced/middleware.html",
                  },
                  {
                    text: "Peningkatan I: Codebase Skala Besar",
                    link: "/id/advanced/structuring.html",
                  },
                  {
                    text: "Peningkatan II: Beban Kerja Tinggi",
                    link: "/id/advanced/scaling.html",
                  },
                  {
                    text: "Peningkatan III: Reliabilitas",
                    link: "/id/advanced/reliability.html",
                  },
                  {
                    text: "Peningkatan IV: Limitasi Flood",
                    link: "/id/advanced/flood.html",
                  },
                  {
                    text: "Transformer API Bot",
                    link: "/id/advanced/transformers.html",
                  },
                  {
                    text: "Dukungan Proxy",
                    link: "/id/advanced/proxy.html",
                  },
                  {
                    text: "Daftar Periksa Deployment",
                    link: "/id/advanced/deployment.html",
                  },
                ],
              },
            ],
          },
          {
            text: "Plugin",
            children: [
              {
                text: "Pendahuluan",
                children: [
                  {
                    text: "Tentang Plugin",
                    link: "/id/plugins/",
                    activeMatch: "^/id/plugins/$",
                  },
                  {
                    text: "Cara Membuat Plugin",
                    link: "/id/plugins/guide.html",
                  },
                ],
              },
              {
                text: "Bawaan",
                children: [
                  {
                    text: "Session dan Penyimpanan Data",
                    link: "/id/plugins/session.html",
                  },
                  {
                    text: "Keyboard Custom dan Inline",
                    link: "/id/plugins/keyboard.html",
                  },
                ],
              },
              {
                text: "Resmi",
                children: [
                  {
                    text: "Percakapan (conversations)",
                    link: "/id/plugins/conversations.html",
                  },
                  {
                    text: "Menu Interaktif (menu)",
                    link: "/id/plugins/menu.html",
                  },
                  {
                    text: "Stateless Question (stateless-question)",
                    link: "/id/plugins/stateless-question.html",
                  },
                  {
                    text: "Concurrency (runner)",
                    link: "/id/plugins/runner.html",
                  },
                  {
                    text: "Hidrasi (hydrate)",
                    link: "/id/plugins/hydrate.html",
                  },
                  {
                    text: "Pengulang Request Api (auto-retry)",
                    link: "/id/plugins/auto-retry.html",
                  },
                  {
                    text: "Kontrol Flood (transformer-throttler)",
                    link: "/id/plugins/transformer-throttler.html",
                  },
                  {
                    text: "Rate Limit Pengguna (ratelimiter)",
                    link: "/id/plugins/ratelimiter.html",
                  },
                  {
                    text: "File (files)",
                    link: "/id/plugins/files.html",
                  },
                  {
                    text: "Internationalization (i18n)",
                    link: "/id/plugins/i18n.html",
                  },
                  {
                    text: "Internationalization (fluent)",
                    link: "/id/plugins/fluent.html",
                  },
                  {
                    text: "Router (router)",
                    link: "/id/plugins/router.html",
                  },
                  {
                    text: "Emoji (emoji)",
                    link: "/id/plugins/emoji.html",
                  },
                  {
                    text: "Parse Mode (parse-mode)",
                    link: "/id/plugins/parse-mode.html",
                  },
                ],
              },
              {
                text: "Pihak Ketiga",
                children: [
                  {
                    text: "Console Time",
                    link: "/id/plugins/console-time.html",
                  },
                  {
                    text: "Kumpulan Middleware yang Berguna",
                    link: "/id/plugins/middlewares.html",
                  },
                  {
                    text: "Autoquote",
                    link: "/id/plugins/autoquote.html",
                  },
                  {
                    text: "[Kirim PR-mu!]",
                    link: "/id/plugins/#buat-plugin-mu-sendiri",
                  },
                ],
              },
            ],
          },
          {
            text: "Contoh",
            children: [
              {
                text: "Contoh",
                children: [
                  {
                    text: "Awesome grammY",
                    link: "https://github.com/grammyjs/awesome-grammY",
                  },
                  {
                    text: "Contoh Repositori Bot",
                    link: "https://github.com/grammyjs/examples",
                  },
                ],
              },
            ],
          },
          {
            text: "Sumber Daya",
            children: [
              {
                text: "grammY",
                children: [
                  {
                    text: "Tentang grammY",
                    link: "/id/resources/about.html",
                  },
                  {
                    text: "Chat Komunitas (Inggris)",
                    link: "https://t.me/grammyjs",
                  },
                  {
                    text: "Chat Komunitas (Rusia)",
                    link: "https://t.me/grammyjs_ru",
                  },
                  {
                    text: "Berita",
                    link: "https://t.me/grammyjs_news",
                  },
                  {
                    text: "Twitter",
                    link: "https://twitter.com/grammy_js",
                  },
                  {
                    text: "FAQ",
                    link: "/id/resources/faq.html",
                  },
                  {
                    text: "Perbandingan dengan Framework Lainnya",
                    link: "/id/resources/comparison.html",
                  },
                ],
              },
              {
                text: "Telegram",
                children: [
                  {
                    text: "Pendahuluan untuk Developer",
                    link: "https://core.telegram.org/bots",
                  },
                  {
                    text: "FAQ tentang Bot",
                    link: "https://core.telegram.org/bots/faq",
                  },
                  {
                    text: "Fitur Bot yang Tersedia",
                    link: "https://core.telegram.org/bots/features",
                  },
                  {
                    text: "Referensi API Bot",
                    link: "https://core.telegram.org/bots/api",
                  },
                  {
                    text: "Contoh Update",
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
                text: "Gambaran Umum",
                children: [
                  {
                    text: "Perbandingan",
                    link: "/id/hosting/comparison.html",
                  },
                ],
              },
              {
                text: "Tutorial",
                children: [
                  {
                    text: "Deno Deploy",
                    link: "/id/hosting/deno-deploy.html",
                  },
                  {
                    text: "Supabase Edge Functions",
                    link: "/id/hosting/supabase.html",
                  },
                  {
                    text: "Heroku",
                    link: "/id/hosting/heroku.html",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/hosting/gcf.html",
                  },
                  {
                    text: "Virtual Private Server",
                    link: "/id/hosting/vps.html",
                  },
                ],
              },
            ],
          },
          {
            text: "Referensi API",
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
                    link: "/zh/guide/",
                    activeMatch: "^/zh/guide/$",
                  },
                  {
                    text: "简介",
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
                    text: "Filter 查询与 bot.on()",
                    link: "/zh/guide/filter-queries.html",
                  },
                  {
                    text: "Commands",
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
                    text: "概述",
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
                    text: "代理支持",
                    link: "/zh/advanced/proxy.html",
                  },
                  {
                    text: "部署",
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
                text: "简介",
                children: [
                  {
                    text: "关于插件",
                    link: "/zh/plugins/",
                    activeMatch: "^/zh/plugins/$",
                  },
                  {
                    text: "如何编写一个插件",
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
                text: "官方维护",
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
                    text: "限制用户速率 (ratelimiter)",
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
                text: "第三方",
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
                    text: "[等待你的 PR!]",
                    link: "/zh/plugins/#创建你自己的插件",
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
                    text: "咨询",
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
            ],
          },
          {
            text: "托管服务",
            children: [
              {
                text: "总览",
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
                    text: "Heroku",
                    link: "/zh/hosting/heroku.html",
                  },
                  {
                    text: "Google Cloud Functions",
                    link: "/zh/hosting/gcf.html",
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
      "/id/": {
        placeholder: "Cari",
        translations: { button: { buttonText: "Cari" } },
      },
    }),
    betterLineBreaks(),
    currentVersions(),
  ],
  markdown: {
    typographer: true,
  },
});
