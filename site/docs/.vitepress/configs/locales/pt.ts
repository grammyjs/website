import type { DocSearchProps } from "node_modules/vitepress/types/docsearch";
import type { LocaleConfig } from "vitepress";
import type { NotFound } from "../../shared/types";
import { social } from "../../shared/vars";

const learnGuide = {
  text: "Guia",
  items: [
    {
      text: "Visão Geral",
      link: "/pt/guide/",
      activeMatch: "^/guide/$",
    },
    {
      text: "Introdução",
      link: "/pt/guide/introduction",
    },
    {
      text: "Primeiros Passos",
      link: "/pt/guide/getting-started",
    },
    {
      text: "Enviando e Recebendo Mensagens",
      link: "/pt/guide/basics",
    },
    {
      text: "Contexto",
      link: "/pt/guide/context",
    },
    {
      text: "Bot API",
      link: "/pt/guide/api",
    },
    {
      text: "Filter Queries e bot.on()",
      link: "/pt/guide/filter-queries",
    },
    {
      text: "Comandos",
      link: "/pt/guide/commands",
    },
    {
      text: "Middleware",
      link: "/pt/guide/middleware",
    },
    {
      text: "Tratamento de Erros",
      link: "/pt/guide/errors",
    },
    {
      text: "Tratando Arquivos",
      link: "/pt/guide/files",
    },
    {
      text: "Jogos",
      link: "/pt/guide/games",
    },
    {
      text: "Long Polling vs. Webhooks",
      link: "/pt/guide/deployment-types",
    },
  ],
};

const learnAdvanced = {
  text: "Avançado",
  items: [
    {
      text: "Visão Geral",
      link: "/pt/advanced/",
      activeMatch: "^/advanced/$",
    },
    {
      text: "Middleware Redux",
      link: "/pt/advanced/middleware",
    },
    {
      text: "Escalando I: Código Fonte Grande",
      link: "/pt/advanced/structuring",
    },
    {
      text: "Escalando II: Alta Carga",
      link: "/pt/advanced/scaling",
    },
    {
      text: "Escalando III: Confiabilidade",
      link: "/pt/advanced/reliability",
    },
    {
      text: "Escalando IV: Limites de Flood",
      link: "/pt/advanced/flood",
    },
    {
      text: "Transformadores da Bot API",
      link: "/pt/advanced/transformers",
    },
    {
      text: "Suporte a Proxy",
      link: "/pt/advanced/proxy",
    },
    {
      text: "Checklist de Deploy",
      link: "/pt/advanced/deployment",
    },
  ],
};

const pluginIntroduction = {
  text: "Introdução",
  items: [
    {
      text: "Sobre os Plugins",
      link: "/pt/plugins/",
      activeMatch: "^/plugins/$",
    },
    {
      text: "Como Escrever um Plugin",
      link: "/pt/plugins/guide",
    },
  ],
};

const pluginBuiltin = {
  text: "Incorporado",
  items: [
    {
      text: "Sessões e Armazenamento de Dados",
      link: "/pt/plugins/session",
    },
    {
      text: "Teclados Inline e Personalizados",
      link: "/pt/plugins/keyboard",
    },
    {
      text: "Grupos de Mídia",
      link: "/pt/plugins/media-group",
    },
    {
      text: "Inline Queries",
      link: "/pt/plugins/inline-query",
    },
  ],
};

const pluginOfficial = {
  text: "Oficial",
  items: [
    {
      text: "Conversas (conversations)",
      link: "/pt/plugins/conversations",
    },
    {
      text: "Menus Interativos (menu)",
      link: "/pt/plugins/menu",
    },
    {
      text: "Perguntas Sem Estados (stateless-question)",
      link: "/pt/plugins/stateless-question",
    },
    {
      text: "Concorrência (runner)",
      link: "/pt/plugins/runner",
    },
    {
      text: "Hidratação (hydrate)",
      link: "/pt/plugins/hydrate",
    },
    {
      text: "Repetir Requisições de API (auto-retry)",
      link: "/pt/plugins/auto-retry",
    },
    {
      text: "Controle de Fluxo (transformer-throttler)",
      link: "/pt/plugins/transformer-throttler",
    },
    {
      text: "Limite de Requisições por Usuário (ratelimiter)",
      link: "/pt/plugins/ratelimiter",
    },
    {
      text: "Arquivos (files)",
      link: "/pt/plugins/files",
    },
    {
      text: "Internacionalização (i18n)",
      link: "/pt/plugins/i18n",
    },
    {
      text: "Internacionalização (fluent)",
      link: "/pt/plugins/fluent",
    },
    {
      text: "Roteador (router)",
      link: "/pt/plugins/router",
    },
    {
      text: "Emoji (emoji)",
      link: "/pt/plugins/emoji",
    },
    {
      text: "Formatação (parse-mode)",
      link: "/pt/plugins/parse-mode",
    },
    {
      text: "Membros do Chat (chat-members)",
      link: "/pt/plugins/chat-members",
    },
  ],
};

const pluginThirdparty = {
  text: "Terceiros",
  items: [
    {
      text: "Console Time",
      link: "/pt/plugins/console-time",
    },
    {
      text: "Middlewares Úteis",
      link: "/pt/plugins/middlewares",
    },
    {
      text: "Citação Automática",
      link: "/pt/plugins/autoquote",
    },
    {
      text: "[Envie seu PR!]",
      link: "/pt/plugins/#create-your-own-plugins",
    },
  ],
};

const resourcesGrammy = {
  text: "grammY",
  items: [
    {
      text: "Sobre o grammY",
      link: "/pt/resources/about",
    },
    {
      text: "Chat da Comunidade (Inglês)",
      link: "https://t.me/grammyjs",
    },
    {
      text: "Chat da Comunidade (Russo)",
      link: "https://t.me/grammyjs_ru",
    },
    {
      text: "Notícias",
      link: "https://t.me/grammyjs_news",
    },
    {
      text: "Twitter",
      link: "https://twitter.com/grammy_js",
    },
    {
      text: "FAQ",
      link: "/pt/resources/faq",
    },
    {
      text: "Comparação com Outros Frameworks",
      link: "/pt/resources/comparison",
    },
  ],
};

const resourcesTelegram = {
  text: "Telegram",
  items: [
    {
      text: "Introdução para Desenvolvedores",
      link: "https://core.telegram.org/bots",
    },
    {
      text: "FAQ de Bots",
      link: "https://core.telegram.org/bots/faq",
    },
    {
      text: "Funcionalidades de Bot",
      link: "https://core.telegram.org/bots/features",
    },
    {
      text: "Referência da Bot API",
      link: "https://core.telegram.org/bots/api",
    },
    {
      text: "Exemplos de Updates",
      link:
        "https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates",
    },
  ],
};

const hostingOverview = {
  text: "Visão Geral",
  items: [
    {
      text: "Comparação",
      link: "/pt/hosting/comparison",
    },
  ],
};

const hostingTutorials = {
  text: "Tutoriais",
  items: [
    {
      text: "Deno Deploy",
      link: "/pt/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/pt/hosting/supabase",
    },
    {
      text: "Cloudflare Workers (Deno)",
      link: "/pt/hosting/cloudflare-workers",
    },
    {
      text: "Cloudflare Workers (Node.js)",
      link: "/pt/hosting/cloudflare-workers-nodejs",
    },
    {
      text: "Heroku",
      link: "/pt/hosting/heroku",
    },
    {
      text: "Fly",
      link: "/pt/hosting/fly",
    },
    {
      text: "Firebase Functions",
      link: "/pt/hosting/firebase",
    },
    {
      text: "Google Cloud Functions",
      link: "/pt/hosting/gcf",
    },
    {
      text: "Vercel",
      link: "/pt/hosting/vercel",
    },
    {
      text: "Virtual Private Server",
      link: "/pt/hosting/vps",
    },
  ],
};

export const sitePt: LocaleConfig = {
  pt: {
    label: "Português",
    lang: "pt-BR",
    title: "grammY",
    description: "O Framework de Bots para o Telegram.",
    themeConfig: {
      nav: [
        { text: "Guia", link: "/pt/guide/" },
        {
          text: "Aprenda",
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
          text: "Exemplos",
          items: [
            {
              text: "Exemplos",
              items: [
                {
                  text: "Awesome grammY",
                  link: "https://github.com/grammyjs/awesome-grammY",
                },
                {
                  text: "Repositorio de Bots de Exemplo",
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
          text: "Hospedando",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "Referência de API",
          link: "https://deno.land/x/grammy/mod.ts",
        },
      ],
      sidebar: {
        "/pt/guide/": [
          { collapsed: false, ...learnGuide },
          { collapsed: true, ...learnAdvanced },
        ],
        "/pt/advanced/": [
          { collapsed: true, ...learnGuide },
          { collapsed: false, ...learnAdvanced },
        ],
        "/pt/plugins/": [
          { collapsed: false, ...pluginIntroduction },
          { collapsed: false, ...pluginBuiltin },
          { collapsed: false, ...pluginOfficial },
          { collapsed: false, ...pluginThirdparty },
        ],
        "/pt/resources/": [
          { collapsed: false, ...resourcesGrammy },
          { collapsed: false, ...resourcesTelegram },
        ],
        "/pt/hosting/": [
          { collapsed: false, ...hostingOverview },
          { collapsed: false, ...hostingTutorials },
        ],
      },
      outline: {
        level: [2, 6],
        label: "Nesta página",
      },
      editLink: {
        text: "Edite esta página no GitHub",
        pattern:
          "https://github.com/grammyjs/website/edit/main/site/docs/:path",
      },
      docFooter: {
        prev: "Página anterior",
        next: "Próxima página",
      },
      lastUpdatedText: "Atualizado por último",
      darkModeSwitchLabel: "Aparência", // only displayed in the mobile view.
      sidebarMenuLabel: "Menu", // only displayed in the mobile view.
      returnToTopLabel: "Voltar ao topo", // only displayed in the mobile view.
      langMenuLabel: "Alterar idioma", // Aria-label
      socialLinks: [
        {
          link: social.telegram.link,
          icon: {
            svg: social.telegram.icon,
          },
          ariaLabel: "link do grupo do grammY no Telegram",
        },
        {
          link: social.github.link,
          icon: social.github.icon,
          ariaLabel: "link do repositório do grammY",
        },
      ],
    },
  },
};

export const searchPt: Record<string, Partial<DocSearchProps>> = {
  root: {
    placeholder: "Pesquisar",
    translations: {
      button: {
        buttonText: "Pesquisar",
        buttonAriaLabel: "Pesquisar",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "Limpar a consulta",
          resetButtonAriaLabel: "Limpar a consulta",
          cancelButtonText: "Cancelar",
          cancelButtonAriaLabel: "Cancelar",
        },
        startScreen: {
          recentSearchesTitle: "Recentes",
          noRecentSearchesText: "Nenhuma pesquisa recent",
          saveRecentSearchButtonTitle: "Salvar esta pesquisa",
          removeRecentSearchButtonTitle: "Remover esta pesquisa do histórico",
          favoriteSearchesTitle: "Favoritas",
          removeFavoriteSearchButtonTitle:
            "Remover esta pesquisa dos favoritos",
        },
        errorScreen: {
          titleText: "Não foi possível buscar os resultados",
          helpText: "Você pode precisar verificar sua conexão de rede.",
        },
        footer: {
          selectText: "selecionar",
          selectKeyAriaLabel: "Tecla enter",
          navigateText: "navegar",
          navigateUpKeyAriaLabel: "Seta para cima",
          navigateDownKeyAriaLabel: "Seta para baixo",
          closeText: "fechar",
          closeKeyAriaLabel: "Tecla esc",
          searchByText: "Pesquisar por",
        },
        noResultsScreen: {
          noResultsText: "Nenhum resultado para",
          suggestedQueryText: "Tente pesquisar por",
          reportMissingResultsText:
            "Acredita que esta consulta deveria retornar resultados?",
          reportMissingResultsLinkText: "Nos avise.",
        },
      },
    },
  },
};

export const notFoundPt: Record<string, NotFound> = {
  root: {
    title: "PÁGINA NÃO ENCONTRADA",
    backToHome: "Me leve pra casa",
    ariaLabel: "Go to home",
    messages: [
      "Eita! Essa página não existe.",
      "Não.",
      "nada aqui procê, foi mal.",
      "Erro 404 \nE agora, quem poderá nos defender?!",
      "Eu vou, eu vou, pra casa agora eu vou...",
    ],
  },
};
