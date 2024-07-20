import type { DocSearchProps } from "node_modules/vitepress/types/docsearch.js";
import type { LocaleConfig } from "vitepress";
import { social } from "../../shared/vars.js";

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
      text: "Reacciones",
      link: "/es/guide/reactions",
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
      text: "Telegram Empresas",
      link: "/advanced/business",
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
    {
      text: "Medios de comunicación",
      link: "/es/plugins/media-group",
    },
    {
      text: "Consultas lineales",
      link: "/es/plugins/inline-query",
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

const resourcesTools = {
  text: "Herramientas",
  items: [
    {
      text: "telegram.tools",
      link: "https://telegram.tools",
    },
    {
      text: "Extensión para VS Code",
      link: "https://github.com/grammyjs/vscode",
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
      text: "Servidor Privado Virtual (VPS)",
      link: "/es/hosting/vps",
    },
    {
      text: "Deno Deploy",
      link: "/es/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/es/hosting/supabase",
    },
    {
      text: "Cloudflare Workers (Deno)",
      link: "/es/hosting/cloudflare-workers",
    },
    {
      text: "Cloudflare Workers (Node.js)",
      link: "/es/hosting/cloudflare-workers-nodejs",
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
      text: "Vercel",
      link: "/es/hosting/vercel",
    },
    {
      text: "Zeabur (Deno)",
      link: "/es/hosting/zeabur-deno",
    },
    {
      text: "Zeabur (Node.js)",
      link: "/es/hosting/zeabur-nodejs",
    },
    {
      text: "Heroku",
      link: "/es/hosting/heroku",
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
          items: [resourcesGrammy, resourcesTelegram, resourcesTools],
        },
        {
          text: "Alojamiento",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "Referencia de la API",
          link: "/ref/",
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
        label: "En esta página",
      },
      editLink: {
        text: "Editar esta página en GitHub",
        pattern:
          "https://github.com/grammyjs/website/edit/main/site/docs/:path",
      },
      docFooter: {
        prev: "Página anterior",
        next: "Página siguiente",
      },
      lastUpdatedText: "Última actualización",
      darkModeSwitchLabel: "Apariencia", // only displayed in the mobile view.
      sidebarMenuLabel: "Menú", // only displayed in the mobile view.
      returnToTopLabel: "Volver al inicio", // only displayed in the mobile view.
      langMenuLabel: "Cambiar el idioma", // Aria-label
      socialLinks: [
        {
          link: social.telegram.link,
          icon: {
            svg: social.telegram.icon,
          },
          ariaLabel: "Enlace del grupo de Telegram de grammY",
        },
        {
          link: social.github.link,
          icon: social.github.icon,
          ariaLabel: "Enlace al repositorio de grammY",
        },
      ],
      notFound: {
        code: "404",
        title: "PÁGINA NO ENCONTRADA",
        linkText: "Llévame a casa",
        linkLabel: "Ir a la página de inicio",
        messages: [
          "¡Uy! Esta página no existe",
          "Nop.",
          "Nada aquí para ti, lo siento",
          "Error 404 \n¡Houston, tenemos un problema!",
          "Vuelveeeee, vuelve a casaaaaa, por navidad",
        ],
      },
    },
  },
};

export const searchEs: Record<string, Partial<DocSearchProps>> = {
  es: {
    placeholder: "Buscar",
    translations: {
      button: {
        buttonText: "Buscar",
        buttonAriaLabel: "Buscar",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "Borrar la consulta",
          resetButtonAriaLabel: "Borrar la consulta",
          cancelButtonText: "Cancelar",
          cancelButtonAriaLabel: "Cancelar",
        },
        startScreen: {
          recentSearchesTitle: "Recientes",
          noRecentSearchesText: "No hay búsquedas recientes",
          saveRecentSearchButtonTitle: "Guardar esta búsqueda",
          removeRecentSearchButtonTitle: "Eliminar esta búsqueda del historial",
          favoriteSearchesTitle: "Favorito",
          removeFavoriteSearchButtonTitle:
            "Eliminar esta búsqueda de los favoritos",
        },
        errorScreen: {
          titleText: "No se pueden obtener resultados",
          helpText: "Puede que quieras comprobar tu conexión de red.",
        },
        footer: {
          selectText: "para seleccionar",
          selectKeyAriaLabel: "Enter",
          navigateText: "para navegar",
          navigateUpKeyAriaLabel: "Flecha arriba",
          navigateDownKeyAriaLabel: "Flecha abajo",
          closeText: "para cerrar",
          closeKeyAriaLabel: "Escape",
          searchByText: "Buscar por",
        },
        noResultsScreen: {
          noResultsText: "No hay resultados para",
          suggestedQueryText: "Intenta buscar por",
          reportMissingResultsText:
            "¿Crees que esta consulta debería devolver resultados?",
          reportMissingResultsLinkText: "Háganoslo saber.",
        },
      },
    },
  },
};
