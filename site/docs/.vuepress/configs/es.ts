import type { DocsearchLocaleData } from "@vuepress/plugin-docsearch";
import type { DefaultThemeLocaleData } from "@vuepress/theme-default";
import type { LocaleConfig, SiteLocaleConfig } from "vuepress-vite";

export const siteEs: SiteLocaleConfig = {
  "/es/": {
    lang: "es-ES",
    title: "grammY",
    description: "El Framework de Bots para Telegram.",
  },
};

export const localeEs: LocaleConfig<DefaultThemeLocaleData> = {
  "/es/": {
    selectLanguageText: "🌍",
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
              {
                text: "Medios de comunicación",
                link: "/plugins/media-group.html",
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
                text: "Cloudflare Workers",
                link: "/es/hosting/cloudflare-workers.html",
              },
              {
                text: "Heroku",
                link: "/es/hosting/heroku.html",
              },
              {
                text: "Fly",
                link: "/es/hosting/fly.html",
              },
              {
                text: "Firebase Functions",
                link: "/es/hosting/firebase.html",
              },
              {
                text: "Google Cloud Functions",
                link: "/es/hosting/gcf.html",
              },
              {
                text: "Vercel",
                link: "/es/hosting/vercel.html",
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
        link: "https://deno.land/x/grammy/mod.ts",
      },
    ],
  },
};

export const docsearchEs: LocaleConfig<DocsearchLocaleData> = {
  "/es/": {
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
