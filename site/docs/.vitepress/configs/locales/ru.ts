import type { DocSearchProps } from "node_modules/vitepress/types/docsearch.js";
import type { LocaleConfig } from "vitepress";
import { social } from "../../shared/vars.js";

const learnGuide = {
  text: "Гайд",
  items: [
    {
      text: "Обзор",
      link: "/guide/",
      activeMatch: "^/guide/$",
    },
    {
      text: "Введение",
      link: "/guide/introduction",
    },
    {
      text: "Начало работы",
      link: "/guide/getting-started",
    },
    {
      text: "Отправка и принятие сообщений",
      link: "/guide/basics",
    },
    {
      text: "Контекст",
      link: "/guide/context",
    },
    {
      text: "Bot API",
      link: "/guide/api",
    },
    {
      text: "Фильтр запросов и bot.on()",
      link: "/guide/filter-queries",
    },
    {
      text: "Команды",
      link: "/guide/commands",
    },
    {
      text: "Реакции",
      link: "/guide/reactions",
    },
    {
      text: "Middleware",
      link: "/guide/middleware",
    },
    {
      text: "Поимка ошибок",
      link: "/guide/errors",
    },
    {
      text: "Обработчик файлов",
      link: "/guide/files",
    },
    {
      text: "Игры",
      link: "/guide/games",
    },
    {
      text: "Long Polling против Вебхуков",
      link: "/guide/deployment-types",
    },
  ],
};

const learnAdvanced = {
  text: "Продвинутый",
  items: [
    {
      text: "Обзор",
      link: "/advanced/",
      activeMatch: "^/advanced/$",
    },
    {
      text: "Возможности Middleware",
      link: "/advanced/middleware",
    },
    {
      text: "Масштабирование I: Большая кодовая база",
      link: "/advanced/structuring",
    },
    {
      text: "Масштабирование II: Высокая нагрузка",
      link: "/advanced/scaling",
    },
    {
      text: "Масштабирование III: Надежность",
      link: "/advanced/reliability",
    },
    {
      text: "Масштабирование IV: Ограничения на флуд",
      link: "/advanced/flood",
    },
    {
      text: "Трансформация Bot API",
      link: "/advanced/transformers",
    },
    {
      text: "Telegram Бизнес",
      link: "/advanced/business",
    },
    {
      text: "Поддержка прокси",
      link: "/advanced/proxy",
    },
    {
      text: "Советы по развертыванию",
      link: "/advanced/deployment",
    },
  ],
};

const pluginIntroduction = {
  text: "Введение",
  items: [
    {
      text: "О плагинах",
      link: "/plugins/",
      activeMatch: "^/plugins/$",
    },
    {
      text: "Как написать плагин",
      link: "/plugins/guide",
    },
  ],
};

const pluginBuiltin = {
  text: "Встроенные",
  items: [
    {
      text: "Сессии и хранение данных",
      link: "/plugins/session",
    },
    {
      text: "Встроенные и собственные клавиатуры",
      link: "/plugins/keyboard",
    },
    {
      text: "Группы медиа",
      link: "/plugins/media-group",
    },
    {
      text: "Inline запросы",
      link: "/plugins/inline-query",
    },
  ],
};

const pluginOfficial = {
  text: "Официальные",
  items: [
    {
      text: "Диалоги (conversations)",
      link: "/plugins/conversations",
    },
    {
      text: "Интерактивные меню (menu)",
      link: "/plugins/menu",
    },
    {
      text: "Вопросы без статуса (stateless-question)",
      link: "/plugins/stateless-question",
    },
    {
      text: "Runner (runner)",
      link: "/plugins/runner",
    },
    {
      text: "Гидратация (hydrate)",
      link: "/plugins/hydrate",
    },
    {
      text: "Повторные запросы к API (auto-retry)",
      link: "/plugins/auto-retry",
    },
    {
      text: "Контроль флуда (transformer-throttler)",
      link: "/plugins/transformer-throttler",
    },
    {
      text: "Лимит запросов пользователей (ratelimiter)",
      link: "/plugins/ratelimiter",
    },
    {
      text: "Файлы (files)",
      link: "/plugins/files",
    },
    {
      text: "Интернационализация (i18n)",
      link: "/plugins/i18n",
    },
    {
      text: "Интернационализация (fluent)",
      link: "/plugins/fluent",
    },
    {
      text: "Роутер (router)",
      link: "/plugins/router",
    },
    {
      text: "Эмодзи (emoji)",
      link: "/plugins/emoji",
    },
    {
      text: "Режим фарматирования (parse-mode)",
      link: "/plugins/parse-mode",
    },
    {
      text: "Пользователи чата (chat-members)",
      link: "/plugins/chat-members",
    },
  ],
};

const pluginThirdparty = {
  text: "Сторонние",
  items: [
    {
      text: "Консоль со временем",
      link: "/plugins/console-time",
    },
    {
      text: "Полезный Middleware",
      link: "/plugins/middlewares",
    },
    {
      text: "Автоцитата",
      link: "/plugins/autoquote",
    },
    {
      text: "[Создайте свой PR!]",
      link: "/plugins/#create-your-own-plugins",
    },
  ],
};

const resourcesGrammy = {
  text: "grammY",
  items: [
    {
      text: "О grammY",
      link: "/resources/about",
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
      text: "Twitter",
      link: "https://twitter.com/grammy_js",
    },
    {
      text: "ЧаВо",
      link: "/resources/faq",
    },
    {
      text: "Как grammY конкурирует с другими фреймворками",
      link: "/resources/comparison",
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
      text: "ссылка на Bot API",
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
      link: "/hosting/comparison",
    },
  ],
};

const hostingTutorials = {
  text: "Туториалы",
  items: [
    {
      text: "Виртуальный выделенный сервер (VPS)",
      link: "/hosting/vps",
    },
    {
      text: "Развертывание Deno",
      link: "/hosting/deno-deploy",
    },
    {
      text: "Функции Supabase Edge",
      link: "/hosting/supabase",
    },
    {
      text: "Cloudflare Workers (Deno)",
      link: "/hosting/cloudflare-workers",
    },
    {
      text: "Cloudflare Workers (Node.js)",
      link: "/hosting/cloudflare-workers-nodejs",
    },
    {
      text: "Fly",
      link: "/hosting/fly",
    },
    {
      text: "Функции Firebase",
      link: "/hosting/firebase",
    },
    {
      text: "Vercel",
      link: "/hosting/vercel",
    },
    {
      text: "Zeabur (Deno)",
      link: "/hosting/zeabur-deno",
    },
    {
      text: "Zeabur (Node.js)",
      link: "/hosting/zeabur-nodejs",
    },
    {
      text: "Heroku",
      link: "/hosting/heroku",
    },
  ],
};

export const siteRu: LocaleConfig = {
  ru: {
    label: "Русский",
    lang: "ru-RU",
    title: "grammY",
    description: "Фреймворк для Telegram ботов.",
    themeConfig: {
      nav: [
        { text: "Гайд", link: "/guide/" },
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
                  text: "Замечательный grammY",
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
        "/guide/": [
          { collapsed: false, ...learnGuide },
          { collapsed: true, ...learnAdvanced },
        ],
        "/advanced/": [
          { collapsed: true, ...learnGuide },
          { collapsed: false, ...learnAdvanced },
        ],
        "/plugins/": [
          { collapsed: false, ...pluginIntroduction },
          { collapsed: false, ...pluginBuiltin },
          { collapsed: false, ...pluginOfficial },
          { collapsed: false, ...pluginThirdparty },
        ],
        "/resources/": [
          { collapsed: false, ...resourcesGrammy },
          { collapsed: false, ...resourcesTelegram },
        ],
        "/hosting/": [
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
        linkText: "Верните меня домоооой",
        linkLabel: "Вернуться домой",
        messages: [
          "Не найдено",
          "Не-а.",
          "Ничего для тебя, извини.",
          "Оишбка 404 \nЭта страница не может быть найдена \nвместо Haiku",
          "Country rooooaaaads,",
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
          favoriteSearchesTitle: "Любимые",
          removeFavoriteSearchButtonTitle: "Убрать этот запрос из любимых",
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
          searchByText: "Поиск по",
        },
        noResultsScreen: {
          noResultsText: "Нет результатов по",
          suggestedQueryText: "Попробуйте поискать",
          reportMissingResultsText:
            "Как вы считаете, должен ли этот запрос возвращать результаты?",
          reportMissingResultsLinkText: "Дайте нам знать.",
        },
      },
    },
  },
};
