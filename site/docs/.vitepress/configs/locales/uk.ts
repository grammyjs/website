import type { DocSearchProps } from "node_modules/vitepress/types/docsearch.js";
import type { LocaleConfig } from "vitepress";
import { social } from "../../shared/vars.js";

const learnGuide = {
  text: "Посібник",
  items: [
    {
      text: "Огляд",
      link: "/uk/guide/",
      activeMatch: "^/uk/guide/$",
    },
    {
      text: "Вступ",
      link: "/uk/guide/introduction",
    },
    {
      text: "Початок роботи",
      link: "/uk/guide/getting-started",
    },
    {
      text: "Надсилання та отримання повідомлень",
      link: "/uk/guide/basics",
    },
    {
      text: "Контекст",
      link: "/uk/guide/context",
    },
    {
      text: "Bot API",
      link: "/uk/guide/api",
    },
    {
      text: "Запити фільтрування та bot.on()",
      link: "/uk/guide/filter-queries",
    },
    {
      text: "Команди",
      link: "/uk/guide/commands",
    },
    {
      text: "Реакції",
      link: "/uk/guide/reactions",
    },
    {
      text: "Проміжні обробники",
      link: "/uk/guide/middleware",
    },
    {
      text: "Обробка помилок",
      link: "/uk/guide/errors",
    },
    {
      text: "Обробка файлів",
      link: "/uk/guide/files",
    },
    {
      text: "Ігри",
      link: "/uk/guide/games",
    },
    {
      text: "Тривале опитування проти вебхуків",
      link: "/uk/guide/deployment-types",
    },
  ],
};

const learnAdvanced = {
  text: "Поглиблення",
  items: [
    {
      text: "Огляд",
      link: "/uk/advanced/",
      activeMatch: "^/uk/advanced/$",
    },
    {
      text: "Можливості проміжних обробників",
      link: "/uk/advanced/middleware",
    },
    {
      text: "Масштабування I: велика кодова база",
      link: "/uk/advanced/structuring",
    },
    {
      text: "Масштабування II: високе навантаження",
      link: "/uk/advanced/scaling",
    },
    {
      text: "Масштабування III: надійність",
      link: "/uk/advanced/reliability",
    },
    {
      text: "Масштабування IV: дотримання лімітів",
      link: "/uk/advanced/flood",
    },
    {
      text: "Перетворювачі Bot API",
      link: "/uk/advanced/transformers",
    },
    {
      text: "Telegram Business",
      link: "/uk/advanced/business",
    },
    {
      text: "Підтримка проксі",
      link: "/uk/advanced/proxy",
    },
    {
      text: "Контрольний список для розгортання",
      link: "/uk/advanced/deployment",
    },
  ],
};

const pluginIntroduction = {
  text: "Вступ",
  items: [
    {
      text: "Про плагіни",
      link: "/uk/plugins/",
      activeMatch: "^/uk/plugins/$",
    },
    {
      text: "Як написати плагін",
      link: "/uk/plugins/guide",
    },
  ],
};

const pluginBuiltin = {
  text: "Вбудовані",
  items: [
    {
      text: "Сесії та збереження даних",
      link: "/uk/plugins/session",
    },
    {
      text: "Вбудовані та власні клавіатури",
      link: "/uk/plugins/keyboard",
    },
    {
      text: "Медіагрупи",
      link: "/uk/plugins/media-group",
    },
    {
      text: "Inline-запити",
      link: "/uk/plugins/inline-query",
    },
  ],
};

const pluginOfficial = {
  text: "Офіційні",
  items: [
    {
      text: "Розмови (conversations)",
      link: "/uk/plugins/conversations",
    },
    {
      text: "Інтерактивні меню (menu)",
      link: "/uk/plugins/menu",
    },
    {
      text: "Питання без стану (stateless-question)",
      link: "/uk/plugins/stateless-question",
    },
    {
      text: "Конкурентність (runner)",
      link: "/uk/plugins/runner",
    },
    {
      text: "Гідратація (hydrate)",
      link: "/uk/plugins/hydrate",
    },
    {
      text: "Повтор запитів до API (auto-retry)",
      link: "/uk/plugins/auto-retry",
    },
    {
      text: "Обмеження запитів до API (transformer-throttler)",
      link: "/uk/plugins/transformer-throttler",
    },
    {
      text: "Обмеження запитів від користувачів (ratelimiter)",
      link: "/uk/plugins/ratelimiter",
    },
    {
      text: "Файли (files)",
      link: "/uk/plugins/files",
    },
    {
      text: "Інтернаціоналізація (i18n)",
      link: "/uk/plugins/i18n",
    },
    {
      text: "Інтернаціоналізація (fluent)",
      link: "/uk/plugins/fluent",
    },
    {
      text: "Маршрутизатор (router)",
      link: "/uk/plugins/router",
    },
    {
      text: "Емодзі (emoji)",
      link: "/uk/plugins/emoji",
    },
    {
      text: "Режим форматування (parse-mode)",
      link: "/uk/plugins/parse-mode",
    },
    {
      text: "Учасники чату (chat-members)",
      link: "/uk/plugins/chat-members",
    },
  ],
};

const pluginThirdparty = {
  text: "Сторонні",
  items: [
    {
      text: "Вимірювання часу обробки запиту",
      link: "/uk/plugins/console-time",
    },
    {
      text: "Корисні проміжні обробники",
      link: "/uk/plugins/middlewares",
    },
    {
      text: "Автоматичне встановлення відповіді",
      link: "/uk/plugins/autoquote",
    },
    {
      text: "[Відправте свій PR!]",
      link: "/uk/plugins/#створюите-власні-плагіни",
    },
  ],
};

const resourcesGrammy = {
  text: "grammY",
  items: [
    {
      text: "Про grammY",
      link: "/uk/resources/about",
    },
    {
      text: "Чат спільноти (Англійська)",
      link: "https://t.me/grammyjs",
    },
    {
      text: "Чат спільноти (Російська)",
      link: "https://t.me/grammyjs_ru",
    },
    {
      text: "Новини",
      link: "https://t.me/grammyjs_news",
    },
    {
      text: "Twitter",
      link: "https://twitter.com/grammy_js",
    },
    {
      text: "ЧаПи",
      link: "/uk/resources/faq",
    },
    {
      text: "Порівняння з іншими фреймворками",
      link: "/uk/resources/comparison",
    },
  ],
};

const resourcesTelegram = {
  text: "Telegram",
  items: [
    {
      text: "Вступ для розробників",
      link: "https://core.telegram.org/bots",
    },
    {
      text: "ЧаПи про ботів",
      link: "https://core.telegram.org/bots/faq",
    },
    {
      text: "Можливості ботів",
      link: "https://core.telegram.org/bots/features",
    },
    {
      text: "Довідка Bot API",
      link: "https://core.telegram.org/bots/api",
    },
    {
      text: "Приклади оновлень",
      link:
        "https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates",
    },
  ],
};

const resourcesTools = {
  text: "Інструменти",
  items: [
    {
      text: "telegram.tools",
      link: "https://telegram.tools",
    },
    {
      text: "VS Code розширення",
      link: "https://github.com/grammyjs/vscode",
    },
  ],
};

const hostingOverview = {
  text: "Огляд",
  items: [
    {
      text: "Порівняння",
      link: "/uk/hosting/comparison",
    },
  ],
};

const hostingTutorials = {
  text: "Посібники",
  items: [
    {
      text: "Віртуальний приватний сервер (VPS)",
      link: "/uk/hosting/vps",
    },
    {
      text: "Deno Deploy",
      link: "/uk/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/uk/hosting/supabase",
    },
    {
      text: "Cloudflare Workers (Deno)",
      link: "/uk/hosting/cloudflare-workers",
    },
    {
      text: "Cloudflare Workers (Node.js)",
      link: "/uk/hosting/cloudflare-workers-nodejs",
    },
    {
      text: "Fly",
      link: "/uk/hosting/fly",
    },
    {
      text: "Firebase Functions",
      link: "/uk/hosting/firebase",
    },
    {
      text: "Vercel",
      link: "/uk/hosting/vercel",
    },
    {
      text: "Zeabur (Deno)",
      link: "/uk/hosting/zeabur-deno",
    },
    {
      text: "Zeabur (Node.js)",
      link: "/uk/hosting/zeabur-nodejs",
    },
    {
      text: "Heroku",
      link: "/uk/hosting/heroku",
    },
  ],
};

export const siteUk: LocaleConfig = {
  uk: {
    label: "Українська",
    lang: "uk-UA",
    title: "grammY",
    description: "Фреймворк для створення Telegram ботів.",
    themeConfig: {
      nav: [
        { text: "Посібник", link: "/uk/guide/" },
        {
          text: "Вивчення",
          items: [learnGuide, learnAdvanced],
        },
        {
          text: "Плагіни",
          items: [
            pluginIntroduction,
            pluginBuiltin,
            pluginOfficial,
            pluginThirdparty,
          ],
        },
        {
          text: "Приклади",
          items: [
            {
              text: "Приклади",
              items: [
                {
                  text: "Дивовижний grammY",
                  link: "https://github.com/grammyjs/awesome-grammY",
                },
                {
                  text: "Репозиторії прикладів ботів",
                  link: "https://github.com/grammyjs/examples",
                },
              ],
            },
          ],
        },
        {
          text: "Ресурси",
          items: [resourcesGrammy, resourcesTelegram, resourcesTools],
        },
        {
          text: "Хостинг",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "Довідка API",
          link: "/ref/",
        },
      ],
      sidebar: {
        "/uk/guide/": [
          { collapsed: false, ...learnGuide },
          { collapsed: true, ...learnAdvanced },
        ],
        "/uk/advanced/": [
          { collapsed: true, ...learnGuide },
          { collapsed: false, ...learnAdvanced },
        ],
        "/uk/plugins/": [
          { collapsed: false, ...pluginIntroduction },
          { collapsed: false, ...pluginBuiltin },
          { collapsed: false, ...pluginOfficial },
          { collapsed: false, ...pluginThirdparty },
        ],
        "/uk/resources/": [
          { collapsed: false, ...resourcesGrammy },
          { collapsed: false, ...resourcesTelegram },
        ],
        "/uk/hosting/": [
          { collapsed: false, ...hostingOverview },
          { collapsed: false, ...hostingTutorials },
        ],
      },
      outline: {
        level: [2, 6],
        label: "На цій сторінці",
      },
      editLink: {
        text: "Редагувати цю сторінку на GitHub",
        pattern:
          "https://github.com/grammyjs/website/edit/main/site/docs/:path",
      },
      docFooter: {
        prev: "Попередня сторінка",
        next: "Наступна сторінка",
      },
      lastUpdatedText: "Востаннє оновлено",
      darkModeSwitchLabel: "Вигляд", // only displayed in the mobile view.
      sidebarMenuLabel: "Меню", // only displayed in the mobile view.
      returnToTopLabel: "До гори", // only displayed in the mobile view.
      langMenuLabel: "Змінити мову", // Aria-label
      socialLinks: [
        {
          link: social.telegram.link,
          icon: {
            svg: social.telegram.icon,
          },
          ariaLabel: "Посилання на групу Telegram grammY",
        },
        {
          link: social.github.link,
          icon: social.github.icon,
          ariaLabel: "Посилання на репозиторій grammY",
        },
      ],
      notFound: {
        code: "404",
        title: "СТОРІНКУ НЕ ЗНАЙДЕНО",
        linkText: "Ніколи не забувайте, звідки ви",
        linkLabel: "Повернутися на головну",
        messages: [
          "Не знайдено",
          "Тут для тебе нічого немає, вибач.",
          "Error 404 \nЦю сторінку не вдалося знайти.",
          "Загубилась, як кит у пустелі.",
          "Знайшлося все, окрім розуму...",
        ],
      },
    },
  },
};

export const searchUk: Record<string, Partial<DocSearchProps>> = {
  uk: {
    placeholder: "Шукати",
    translations: {
      button: {
        buttonText: "Шукати",
        buttonAriaLabel: "Шукати",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "Очистити запит",
          resetButtonAriaLabel: "Очистити запит",
          cancelButtonText: "Скасувати",
          cancelButtonAriaLabel: "Скасувати",
        },
        startScreen: {
          recentSearchesTitle: "Останні",
          noRecentSearchesText: "Немає останніх пошуків",
          saveRecentSearchButtonTitle: "Зберегти цей пошук",
          removeRecentSearchButtonTitle: "Видалити цей пошук з історії",
          favoriteSearchesTitle: "Улюблені",
          removeFavoriteSearchButtonTitle: "Видалити цей пошук з улюблених",
        },
        errorScreen: {
          titleText: "Не вдалося отримати результати",
          helpText: "Ви можете перевірити підключення до мережі.",
        },
        footer: {
          selectText: "обрати",
          selectKeyAriaLabel: "клавіша Enter",
          navigateText: "пересуватися",
          navigateUpKeyAriaLabel: "Стрілка вгору",
          navigateDownKeyAriaLabel: "Стрілка вниз",
          closeText: "закрити",
          closeKeyAriaLabel: "клавіша Escape",
          searchByText: "Шукати за допомогою",
        },
        noResultsScreen: {
          noResultsText: "Немає результатів для",
          suggestedQueryText: "Спробуйте пошукати",
          reportMissingResultsText:
            "Вважаєте, що цей запит повинен повернути результати?",
          reportMissingResultsLinkText: "Дайте нам знати.",
        },
      },
    },
  },
};
