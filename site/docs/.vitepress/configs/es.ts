import type { LocalSearchTranslations } from "node_modules/vitepress/types/local-search";
import type { LocaleConfig } from "vitepress";
import { social } from "../shared/vars";
import type { NotFound } from "../shared/types";

const learnGuide = {
  text: "Guía",
  items: [
    {
      text: "Resumen",
      link: "/es/guide/",
      activeMatch: "^/es/guide/$",
    },
    {
      text: "Introducción",
      link: "/es/guide/introduction",
    },
    {
      text: "Cómo empezar",
      link: "/es/guide/getting-started",
    },
    {
      text: "Envío y recepción de mensajes",
      link: "/es/guide/basics",
    },
    {
      text: "Contexto",
      link: "/es/guide/context",
    },
    {
      text: "API para bots",
      link: "/es/guide/api",
    },
    {
      text: "Filtrar consultas y bot.on()",
      link: "/es/guide/filter-queries",
    },
    {
      text: "Comandos",
      link: "/es/guide/commands",
    },
    {
      text: "Middleware",
      link: "/es/guide/middleware",
    },
    {
      text: "Manejo de errores",
      link: "/es/guide/errors",
    },
    {
      text: "Consultas lineales",
      link: "/es/guide/inline-queries",
    },
    {
      text: "Manejo de archivos",
      link: "/es/guide/files",
    },
    {
      text: "Juegos",
      link: "/es/guide/games",
    },
    {
      text: "Long Polling frente a Webhooks",
      link: "/es/guide/deployment-types",
    },
  ],
};

const learnAdvanced = {
  text: "Avanzado",
  items: [
    {
      text: "Resumen",
      link: "/es/advanced/",
      activeMatch: "^/es/advanced/$",
    },
    {
      text: "Middleware en profundidad",
      link: "/es/advanced/middleware",
    },
    {
      text: "Escalando I: Código base grande",
      link: "/es/advanced/structuring",
    },
    {
      text: "Escalando II: Alta carga",
      link: "/es/advanced/scaling",
    },
    {
      text: "Escalando III: Fiabilidad",
      link: "/es/advanced/reliability",
    },
    {
      text: "Escalando IV: Límites de flujo",
      link: "/es/advanced/flood",
    },
    {
      text: "Transformadores de la API del Bot",
      link: "/es/advanced/transformers",
    },
    {
      text: "Soporte para proxy",
      link: "/es/advanced/proxy",
    },
    {
      text: "Lista de comprobación del despliegue",
      link: "/es/advanced/deployment",
    },
  ],
};

const pluginIntroduction = {
  text: "Introducción",
  items: [
    {
      text: "Acerca de los complementos",
      link: "/es/plugins/",
      activeMatch: "^/es/plugins/$",
    },
    {
      text: "Cómo escribir complementos",
      link: "/es/plugins/guide",
    },
  ],
};

const pluginBuiltin = {
  text: "Incorporado",
  items: [
    {
      text: "Sesiones y almacenamiento de datos",
      link: "/es/plugins/session",
    },
    {
      text: "Teclados lineales y personalizados",
      link: "/es/plugins/keyboard",
    },
  ],
};

const pluginOfficial = {
  text: "Oficial",
  items: [
    {
      text: "Conversaciones (conversations)",
      link: "/es/plugins/conversations",
    },
    {
      text: "Menus Interactivos (menu)",
      link: "/es/plugins/menu",
    },
    {
      text: "Preguntas sin estado (stateless-question)",
      link: "/es/plugins/stateless-question",
    },
    {
      text: "Concurrencia (runner)",
      link: "/es/plugins/runner",
    },
    {
      text: "Hidratación (hydrate)",
      link: "/es/plugins/hydrate",
    },
    {
      text: "Reintentar solicitudes de la API (auto-retry)",
      link: "/es/plugins/auto-retry",
    },
    {
      text: "Control de flujo (transformer-throttler)",
      link: "/es/plugins/transformer-throttler",
    },
    {
      text: "Usuarios con límite de peticiones (ratelimiter)",
      link: "/es/plugins/ratelimiter",
    },
    {
      text: "Archivos (files)",
      link: "/es/plugins/files",
    },
    {
      text: "Internacionalización (i18n)",
      link: "/es/plugins/i18n",
    },
    {
      text: "Internacionalización (fluent)",
      link: "/es/plugins/fluent",
    },
    {
      text: "Enrutador (router)",
      link: "/es/plugins/router",
    },
    {
      text: "Emojis (emoji)",
      link: "/es/plugins/emoji",
    },
    {
      text: "Modo de parsear (parse-mode)",
      link: "/es/plugins/parse-mode",
    },
  ],
};

const pluginThirdparty = {
  text: "De Terceros",
  items: [
    {
      text: "Tiempo de consola",
      link: "/es/plugins/console-time",
    },
    {
      text: "Middlewares de utilidad",
      link: "/es/plugins/middlewares",
    },
    {
      text: "Citar automáticamente",
      link: "/es/plugins/autoquote",
    },
    {
      text: "[¡Envíe su PR!]",
      link: "/es/plugins/#crear-tus-propios-plugins",
    },
  ],
};

const resourcesGrammy = {
  text: "grammY",
  items: [
    {
      text: "Sobre grammY",
      link: "/es/resources/about",
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
      link: "/es/resources/faq",
    },
    {
      text: "Comparación con otros frameworks",
      link: "/es/resources/comparison",
    },
  ],
};

const resourcesTelegram = {
  text: "Telegram",
  items: [
    {
      text: "Introducción para desarrolladores",
      link: "https://core.telegram.org/bots",
    },
    {
      text: "Preguntas frecuentes de bots",
      link: "https://core.telegram.org/bots/faq",
    },
    {
      text: "Funcionalidades de los bots",
      link: "https://core.telegram.org/bots/features",
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
};

const hostingOverview = {
  text: "Resumen",
  items: [
    {
      text: "Comparativa",
      link: "/es/hosting/comparison",
    },
  ],
};

const hostingTutorials = {
  text: "Tutoriales",
  items: [
    {
      text: "Deno Deploy",
      link: "/es/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/es/hosting/supabase",
    },
    {
      text: "Cloudflare Workers",
      link: "/es/hosting/cloudflare-workers",
    },
    {
      text: "Heroku",
      link: "/es/hosting/heroku",
    },
    {
      text: "Fly",
      link: "/es/hosting/fly",
    },
    {
      text: "Firebase Functions",
      link: "/es/hosting/firebase",
    },
    {
      text: "Google Cloud Functions",
      link: "/es/hosting/gcf",
    },
    {
      text: "Vercel",
      link: "/es/hosting/vercel",
    },
    {
      text: "Servidor Privado Virtual",
      link: "/es/hosting/vps",
    },
  ],
};

export const siteEs: LocaleConfig = {
  es: {
    label: "Español",
    lang: "es-ES",
    title: "grammY",
    description: "El Framework de Bots para Telegram.",
    themeConfig: {
      nav: [
        { text: "Guía", link: "/es/guide/" },
        {
          text: "Aprender",
          items: [learnGuide, learnAdvanced],
        },
        {
          text: "Complementos",
          items: [
            pluginIntroduction,
            pluginBuiltin,
            pluginOfficial,
            pluginThirdparty,
          ],
        },
        {
          text: "Ejemplos",
          items: [
            {
              text: "Ejemplos",
              items: [
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
          items: [resourcesGrammy, resourcesTelegram],
        },
        {
          text: "Alojamiento",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "Referencia de API",
          link: "https://deno.land/x/grammy/mod.ts",
        },
      ],
      sidebar: {
        "/es/guide/": [
          { collapsed: false, ...learnGuide },
          { collapsed: true, ...learnAdvanced },
        ],
        "/es/advanced/": [
          { collapsed: true, ...learnGuide },
          { collapsed: false, ...learnAdvanced },
        ],
        "/es/plugins/": [
          { collapsed: false, ...pluginIntroduction },
          { collapsed: false, ...pluginBuiltin },
          { collapsed: false, ...pluginOfficial },
          { collapsed: false, ...pluginThirdparty },
        ],
        "/es/resources/": [
          { collapsed: false, ...resourcesGrammy },
          { collapsed: false, ...resourcesTelegram },
        ],
        "/es/hosting/": [
          { collapsed: false, ...hostingOverview },
          { collapsed: false, ...hostingTutorials },
        ],
      },
      outline: {
        level: [2, 6],
        label: "On this page",
      },
      editLink: {
        text: "Editar esta página en GitHub",
        pattern:
          "https://github.com/grammyjs/website/edit/main/site/docs/:path",
      },
      lastUpdatedText: "Última actualización",
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

export const searchEs: LocalSearchTranslations = {
  button: {
    buttonText: "Buscar",
    buttonAriaLabel: "Buscar",
  },
  modal: {
    noResultsText: "No hay resultados para", // 'No result for "$keyword"'
    displayDetails: "Display detailed list",
    resetButtonTitle: "Reset search",
    backButtonTitle: "Close search",
    footer: {
      selectText: "para seleccionar", // $enter to select
      selectKeyAriaLabel: "Enter",
      navigateText: "para navegar", // $arrow to navigate
      navigateUpKeyAriaLabel: "Flecha arriba",
      navigateDownKeyAriaLabel: "Flecha abajo",
      closeText: "para cerrar", // $esc to close
      closeKeyAriaLabel: "Escape",
    },
  },
};

export const notFoundEs: Record<string, NotFound> = {
  es: {
    title: "PAGE NOT FOUND",
    backToHome: "Llévame a casa",
    ariaLabel: "Go to home",
    messages: [
      "¡Uy! Esta página no existe",
      "Nop.",
      "Nada aquí para ti, lo siento",
      "Error 404 \n¡Houston, tenemos un problema!",
      "Vuelveeeee, vuelve a casaaaaa, por navidad",
    ],
  },
};
