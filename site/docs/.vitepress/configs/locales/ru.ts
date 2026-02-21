import type { DocSearchProps } from "node_modules/vitepress/types/docsearch.js";
import type { LocaleConfig } from "vitepress";
import { social } from "../../shared/vars.js";

const learnGuide = {
  text: "Гайд",
  items: [
    {
      text: "Обзор",
      link: "/ru/guide/",
      activeMatch: "^/ru/guide/$",
    },
    {
      text: "Введение",
      link: "/ru/guide/introduction",
    },
    {
      text: "Начало работы",
      link: "/ru/guide/getting-started",
    },
    {
      text: "Отправка и получение сообщений",
      link: "/ru/guide/basics",
    },
    {
      text: "Контекст",
      link: "/ru/guide/context",
    },
    {
      text: "Bot API",
      link: "/ru/guide/api",
    },
    {
      text: "Фильтр запросов и bot.on()",
      link: "/ru/guide/filter-queries",
    },
    {
      text: "Команды",
      link: "/ru/guide/commands",
    },
    {
      text: "Реакции",
      link: "/ru/guide/reactions",
    },
    {
      text: "Middleware",
      link: "/ru/guide/middleware",
    },
    {
      text: "Обработка ошибок",
      link: "/ru/guide/errors",
    },
    {
      text: "Обработчик файлов",
      link: "/ru/guide/files",
    },
    {
      text: "Игры",
      link: "/ru/guide/games",
    },
    {
      text: "Long Polling против Webhooks",
      link: "/ru/guide/deployment-types",
    },
  ],
};

const learnAdvanced = {
  text: "Продвинутый",
  items: [
    {
      text: "Обзор",
      link: "/ru/advanced/",
      activeMatch: "^/ru/advanced/$",
    },
    {
      text: "Возможности Middleware",
      link: "/ru/advanced/middleware",
    },
    {
      text: "Масштабирование I: Большая кодовая база",
      link: "/ru/advanced/structuring",
    },
    {
      text: "Масштабирование II: Высокая нагрузка",
      link: "/ru/advanced/scaling",
    },
    {
      text: "Масштабирование III: Надежность",
      link: "/ru/advanced/reliability",
    },
    {
      text: "Масштабирование IV: Ограничения на флуд",
      link: "/ru/advanced/flood",
    },
    {
      text: "Трансформация Bot API",
      link: "/ru/advanced/transformers",
    },
    {
      text: "Telegram Бизнес",
      link: "/ru/advanced/business",
    },
    {
      text: "Поддержка прокси",
      link: "/ru/advanced/proxy",
    },
    {
      text: "Советы по развертыванию",
      link: "/ru/advanced/deployment",
    },
  ],
};

const pluginIntroduction = {
  text: "Введение",
  items: [
    {
      text: "О плагинах",
      link: "/ru/plugins/",
      activeMatch: "^/ru/plugins/$",
    },
    {
      text: "Как написать плагин",
      link: "/ru/plugins/guide",
    },
  ],
};

const pluginBuiltin = {
  text: "Встроенные",
  items: [
    {
      text: "Сессии и хранение данных",
      link: "/ru/plugins/session",
    },
    {
      text: "Встроенные и собственные клавиатуры",
      link: "/ru/plugins/keyboard",
    },
    {
      text: "Группы медиа",
      link: "/ru/plugins/media-group",
    },
    {
      text: "Inline запросы",
      link: "/ru/plugins/inline-query",
    },
  ],
};

const pluginOfficial = {
  text: "Официальные",
  items: [
    {
      text: "Диалоги (conversations)",
      link: "/ru/plugins/conversations",
    },
    {
      text: "Интерактивные меню (menu)",
      link: "/ru/plugins/menu",
    },
    {
      text: "Вопросы без состояния (stateless-question)",
      link: "/ru/plugins/stateless-question",
    },
    {
      text: "Runner (runner)",
      link: "/ru/plugins/runner",
    },
    {
      text: "Гидратация (hydrate)",
      link: "/ru/plugins/hydrate",
    },
    {
      text: "Повторные запросы к API (auto-retry)",
      link: "/ru/plugins/auto-retry",
    },
    {
      text: "Контроль флуда (transformer-throttler)",
      link: "/ru/plugins/transformer-throttler",
    },
    {
      text: "Лимит запросов пользователей (ratelimiter)",
      link: "/ru/plugins/ratelimiter",
    },
    {
      text: "Файлы (files)",
      link: "/ru/plugins/files",
    },
    {
      text: "Интернационализация (i18n)",
      link: "/ru/plugins/i18n",
    },
    {
      text: "Интернационализация (fluent)",
      link: "/ru/plugins/fluent",
    },
    {
      text: "Роутер (router)",
      link: "/ru/plugins/router",
    },
    {
      text: "Эмодзи (emoji)",
      link: "/ru/plugins/emoji",
    },
    {
      text: "Режим форматирования (parse-mode)",
      link: "/ru/plugins/parse-mode",
    },
    {
      text: "Пользователи чата (chat-members)",
      link: "/ru/plugins/chat-members",
    },
    {
      text: "Команды (commands)",
      link: "/ru/plugins/commands",
    },
  ],
};

const pluginThirdparty = {
  text: "Сторонние",
  items: [
    {
      text: "Консоль со временем",
      link: "/ru/plugins/console-time",
    },
    {
      text: "Полезный Middleware",
      link: "/ru/plugins/middlewares",
    },
    {
      text: "Автоцитата",
      link: "/ru/plugins/autoquote",
    },
    {
      text: "Парсер сущностей",
      link: "/ru/plugins/entity-parser",
    },
    {
      text: "[Создайте свой PR!]",
      link: "/ru/plugins/#create-your-own-plugins",
    },
  ],
};

const resourcesGrammy = {
  text: "grammY",
  items: [
    {
      text: "О grammY",
      link: "/ru/resources/about",
    },
    {
      text: "Чат сообщества (Англоязычный)",
      link: "https://t.me/grammyjs",
    },
    {
      text: "Чат сообщества (Русскоязычный)",
      link: "https://t.me/grammyjs_ru",
    },
    {
      text: "Новости",
      link: "https://t.me/grammyjs_news",
    },
    {
      text: "ЧаВо",
      link: "/ru/resources/faq",
    },
    {
      text: "Как grammY конкурирует с другими библиотеками",
      link: "/ru/resources/comparison",
    },
  ],
};

const resourcesTelegram = {
  text: "Telegram",
  items: [
    {
      text: "Введение для разработчиков",
      link: "https://core.telegram.org/bots",
    },
    {
      text: "ЧаВо по ботам",
      link: "https://core.telegram.org/bots/faq",
    },
    {
      text: "Возможности ботов",
      link: "https://core.telegram.org/bots/features",
    },
    {
      text: "Ссылка на Bot API",
      link: "https://core.telegram.org/bots/api",
    },
    {
      text: "Примеры обновлений",
      link:
        "https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates",
    },
  ],
};

const resourcesTools = {
  text: "Инструменты",
  items: [
    {
      text: "telegram.tools",
      link: "https://telegram.tools",
    },
    {
      text: "Расширение для VS Code",
      link: "https://github.com/grammyjs/vscode",
    },
  ],
};

const hostingOverview = {
  text: "Обзор",
  items: [
    {
      text: "Сравнение",
      link: "/ru/hosting/comparison",
    },
  ],
};

const hostingTutorials = {
  text: "Туториалы",
  items: [
    {
      text: "Виртуальный выделенный сервер (VPS)",
      link: "/ru/hosting/vps",
    },
    {
      text: "Развертывание Deno",
      link: "/ru/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/ru/hosting/supabase",
    },
    {
      text: "Cloudflare Workers (Deno)",
      link: "/ru/hosting/cloudflare-workers",
    },
    {
      text: "Cloudflare Workers (Node.js)",
      link: "/ru/hosting/cloudflare-workers-nodejs",
    },
    {
      text: "Fly",
      link: "/ru/hosting/fly",
    },
    {
      text: "Firebase Functions",
      link: "/ru/hosting/firebase",
    },
    {
      text: "Vercel",
      link: "/ru/hosting/vercel",
    },
    {
      text: "Zeabur (Deno)",
      link: "/ru/hosting/zeabur-deno",
    },
    {
      text: "Zeabur (Node.js)",
      link: "/ru/hosting/zeabur-nodejs",
    },
    {
      text: "Heroku",
      link: "/ru/hosting/heroku",
    },
  ],
};

export const siteRu: LocaleConfig = {
  ru: {
    label: "Русский",
    lang: "ru-RU",
    title: "grammY",
    description: "Библиотека для создания Telegram ботов.",
    themeConfig: {
      nav: [
        { text: "Гайд", link: "/ru/guide/" },
        {
          text: "Изучение",
          items: [learnGuide, learnAdvanced],
        },
        {
          text: "Плагины",
          items: [
            pluginIntroduction,
            pluginBuiltin,
            pluginOfficial,
            pluginThirdparty,
          ],
        },
        {
          text: "Примеры",
          items: [
            {
              text: "Примеры",
              items: [
                {
                  text: "Проекты сообщества (awesome grammY)",
                  link: "https://github.com/grammyjs/awesome-grammY",
                },
                {
                  text: "Примеры ботов",
                  link: "https://github.com/grammyjs/examples",
                },
              ],
            },
          ],
        },
        {
          text: "Ресурсы",
          items: [resourcesGrammy, resourcesTelegram, resourcesTools],
        },
        {
          text: "Хостинг",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "Справочник API",
          link: "/ref/",
        },
      ],
      sidebar: {
        "/ru/guide/": [
          { collapsed: false, ...learnGuide },
          { collapsed: true, ...learnAdvanced },
        ],
        "/ru/advanced/": [
          { collapsed: true, ...learnGuide },
          { collapsed: false, ...learnAdvanced },
        ],
        "/ru/plugins/": [
          { collapsed: false, ...pluginIntroduction },
          { collapsed: false, ...pluginBuiltin },
          { collapsed: false, ...pluginOfficial },
          { collapsed: false, ...pluginThirdparty },
        ],
        "/ru/resources/": [
          { collapsed: false, ...resourcesGrammy },
          { collapsed: false, ...resourcesTelegram },
        ],
        "/ru/hosting/": [
          { collapsed: false, ...hostingOverview },
          { collapsed: false, ...hostingTutorials },
        ],
      },
      outline: {
        level: [2, 6],
        label: "На этой странице",
      },
      editLink: {
        text: "Отредактируйте эту страницу на GitHub",
        pattern:
          "https://github.com/grammyjs/website/edit/main/site/docs/:path",
      },
      docFooter: {
        prev: "Предыдущая страница",
        next: "Следующая страница",
      },
      lastUpdatedText: "Последнее обновление",
      darkModeSwitchLabel: "Внешний вид", // only displayed in the mobile view.
      sidebarMenuLabel: "Меню", // only displayed in the mobile view.
      returnToTopLabel: "Вернуться наверх", // only displayed in the mobile view.
      langMenuLabel: "Сменить язык", // Aria-label
      socialLinks: [
        {
          link: social.telegram.link,
          icon: {
            svg: social.telegram.icon,
          },
          ariaLabel: "Чат grammY в Telegram",
        },
        {
          link: social.github.link,
          icon: social.github.icon,
          ariaLabel: "Ссылка на репозиторий grammY",
        },
      ],
      notFound: {
        code: "404",
        title: "Страница не найдена",
        linkText:
          "Вернуться домой (смотрите чтобы вас не загнали, а то вы больше не сможете погулять)",
        linkLabel: "Вернуться домой",
        messages: [
          "Они не смогли найти золото, Mased.",
          "Запрашиваемая страница не найдена 🙄💅",
          "Ничего для тебя, сорянчик.",
          "Ошибка 404",
          "Я знаю, где живёт любовь.\nВ каких укромных уголках твоей души её искать...",
        ],
      },
    },
  },
};

export const searchRu: Record<string, Partial<DocSearchProps>> = {
  ru: {
    placeholder: "Поиск",
    translations: {
      button: {
        buttonText: "Поиск",
        buttonAriaLabel: "Поиск",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "Очистить запрос",
          resetButtonAriaLabel: "Очистить запрос",
          cancelButtonText: "Отмена",
          cancelButtonAriaLabel: "Отмена",
        },
        startScreen: {
          recentSearchesTitle: "Последнее",
          noRecentSearchesText: "Нет последних запросов",
          saveRecentSearchButtonTitle: "Сохранить этот запрос",
          removeRecentSearchButtonTitle: "Убрать этот запрос из истории",
          favoriteSearchesTitle: "Любимые запросы",
          removeFavoriteSearchButtonTitle:
            "Убрать этот запрос из списка любимых",
        },
        errorScreen: {
          titleText: "Невозможно получить результаты",
          helpText: "Возможно, вам следует проверить подключение к сети.",
        },
        footer: {
          selectText: "чтобы выбрать",
          selectKeyAriaLabel: "Введите ключ",
          navigateText: "чтобы перемещаться",
          navigateUpKeyAriaLabel: "Стрелка вверх",
          navigateDownKeyAriaLabel: "Стрелка вниз",
          closeText: "чтобы закрыть",
          closeKeyAriaLabel: "Клавиша Escape",
          searchByText: "Поиск сделан с помощью",
        },
        noResultsScreen: {
          noResultsText: "Нет результатов по запросу:",
          suggestedQueryText: "Попробуйте поискать",
          reportMissingResultsText:
            "Как вы считаете, должен ли этот запрос возвращать результаты?",
          reportMissingResultsLinkText: "Дайте нам знать.",
        },
      },
    },
  },
};
