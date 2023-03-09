import type { DocsearchLocaleData } from "@vuepress/plugin-docsearch";
import type { DefaultThemeLocaleData } from "@vuepress/theme-default";
import type { LocaleConfig, SiteLocaleConfig } from "vuepress-vite";

export const siteUk: SiteLocaleConfig = {
  "/uk/": {
    lang: "uk-UA",
    title: "grammY",
    description: "Фреймворк для створення Telegram ботів.",
  },
};

export const localeUk: LocaleConfig<DefaultThemeLocaleData> = {
  "/uk/": {
    selectLanguageText: "Мови",
    selectLanguageName: "Українська",
    editLinkText: "Редагувати цю сторінку на GitHub",
    notFound: [
      "Не знайдено",
      "Тут для тебе нічого немає, вибач.",
      "Error 404/ Цю сторінку не вдалося знайти.",
      "Загубилась, як кит у пустелі.",
      "Знайшлося все, окрім розуму...",
    ],
    backToHome: "Ніколи не забувай, звідки ти",
    navbar: [
      { text: "Посібник", link: "/uk/guide/" },
      {
        text: "Вивчення",
        children: [
          {
            text: "Посібник",
            children: [
              {
                text: "Огляд",
                link: "/uk/guide/",
                activeMatch: "^/guide/$",
              },
              {
                text: "Вступ",
                link: "/uk/guide/introduction.html",
              },
              {
                text: "Початок роботи",
                link: "/uk/guide/getting-started.html",
              },
              {
                text: "Надсилання та отримання повідомлень",
                link: "/uk/guide/basics.html",
              },
              {
                text: "Контекст",
                link: "/uk/guide/context.html",
              },
              {
                text: "Bot API",
                link: "/uk/guide/api.html",
              },
              {
                text: "Запити фільтрування та bot.on()",
                link: "/uk/guide/filter-queries.html",
              },
              {
                text: "Команди",
                link: "/uk/guide/commands.html",
              },
              {
                text: "Middleware",
                link: "/uk/guide/middleware.html",
              },
              {
                text: "Обробка помилок",
                link: "/uk/guide/errors.html",
              },
              {
                text: "Вбудовані запити",
                link: "/uk/guide/inline-queries.html",
              },
              {
                text: "Обробка файлів",
                link: "/uk/guide/files.html",
              },
              {
                text: "Ігри",
                link: "/uk/guide/games.html",
              },
              {
                text: "Тривале опитування проти вебхуків",
                link: "/uk/guide/deployment-types.html",
              },
            ],
          },
          {
            text: "Розвиток",
            children: [
              {
                text: "Огляд",
                link: "/uk/advanced/",
                activeMatch: "^/advanced/$",
              },
              {
                text: "Спрощення middleware",
                link: "/uk/advanced/middleware.html",
              },
              {
                text: "Масштабування I: Велика кодова база",
                link: "/uk/advanced/structuring.html",
              },
              {
                text: "Масштабування II: Високе навантаження",
                link: "/uk/advanced/scaling.html",
              },
              {
                text: "Масштабування III: Надійність",
                link: "/uk/advanced/reliability.html",
              },
              {
                text: "Масштабування IV: Обмеження переповнення",
                link: "/uk/advanced/flood.html",
              },
              {
                text: "Перетворювачі Bot API",
                link: "/uk/advanced/transformers.html",
              },
              {
                text: "Підтримка проксі",
                link: "/uk/advanced/proxy.html",
              },
              {
                text: "Контрольний список для розгортання",
                link: "/uk/advanced/deployment.html",
              },
            ],
          },
        ],
      },
      {
        text: "Плагіни",
        children: [
          {
            text: "Вступ",
            children: [
              {
                text: "Про плагіни",
                link: "/uk/plugins/",
                activeMatch: "^/plugins/$",
              },
              {
                text: "Як написати плагін",
                link: "/uk/plugins/guide.html",
              },
            ],
          },
          {
            text: "Вбудовані",
            children: [
              {
                text: "Сесії та збереження даних",
                link: "/uk/plugins/session.html",
              },
              {
                text: "Вбудовані та власні клавіатури",
                link: "/uk/plugins/keyboard.html",
              },
            ],
          },
          {
            text: "Офіціальні",
            children: [
              {
                text: "Розмови (conversations)",
                link: "/uk/plugins/conversations.html",
              },
              {
                text: "Інтерактивні меню (menu)",
                link: "/uk/plugins/menu.html",
              },
              {
                text: "Питання без стану (stateless-question)",
                link: "/uk/plugins/stateless-question.html",
              },
              {
                text: "Конкурентність (runner)",
                link: "/uk/plugins/runner.html",
              },
              {
                text: "Гідратація (hydrate)",
                link: "/uk/plugins/hydrate.html",
              },
              {
                text: "Повтор запитів до API (auto-retry)",
                link: "/uk/plugins/auto-retry.html",
              },
              {
                text: "Обмеження запитів до API (transformer-throttler)",
                link: "/uk/plugins/transformer-throttler.html",
              },
              {
                text: "Обмеження запитів від користувачів (ratelimiter)",
                link: "/uk/plugins/ratelimiter.html",
              },
              {
                text: "Файли (files)",
                link: "/uk/plugins/files.html",
              },
              {
                text: "Інтернаціоналізація (i18n)",
                link: "/uk/plugins/i18n.html",
              },
              {
                text: "Інтернаціоналізація (fluent)",
                link: "/uk/plugins/fluent.html",
              },
              {
                text: "Маршрутизатор (router)",
                link: "/uk/plugins/router.html",
              },
              {
                text: "Емодзі (emoji)",
                link: "/uk/plugins/emoji.html",
              },
              {
                text: "Режим форматування (parse-mode)",
                link: "/uk/plugins/parse-mode.html",
              },
            ],
          },
          {
            text: "Сторонні",
            children: [
              {
                text: "Вимірювання часу обробки запиту",
                link: "/uk/plugins/console-time.html",
              },
              {
                text: "Корисні middleware",
                link: "/uk/plugins/middlewares.html",
              },
              {
                text: "Автоматичне встановлення відповіді",
                link: "/uk/plugins/autoquote.html",
              },
              {
                text: "[Відправте свій PR!]",
                link: "/uk/plugins/#create-your-own-plugins",
              },
            ],
          },
        ],
      },
      {
        text: "Приклади",
        children: [
          {
            text: "Приклади",
            children: [
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
        children: [
          {
            text: "grammY",
            children: [
              {
                text: "Про grammY",
                link: "/uk/resources/about.html",
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
                link: "/uk/resources/faq.html",
              },
              {
                text: "Порівняння з іншими фреймворками",
                link: "/uk/resources/comparison.html",
              },
            ],
          },
          {
            text: "Telegram",
            children: [
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
          },
        ],
      },
      {
        text: "Хостинг",
        children: [
          {
            text: "Огляд",
            children: [
              {
                text: "Порівняння",
                link: "/uk/hosting/comparison.html",
              },
            ],
          },
          {
            text: "Посібники",
            children: [
              {
                text: "Deno Deploy",
                link: "/uk/hosting/deno-deploy.html",
              },
              {
                text: "Supabase Edge Functions",
                link: "/uk/hosting/supabase.html",
              },
              {
                text: "Heroku",
                link: "/uk/hosting/heroku.html",
              },
              {
                text: "Fly",
                link: "/uk/hosting/fly.html",
              },
              {
                text: "Google Cloud Functions",
                link: "/uk/hosting/gcf.html",
              },
              {
                text: "Vercel",
                link: "/uk/hosting/vercel.html",
              },
              {
                text: "Віртуальний приватний сервер",
                link: "/uk/hosting/vps.html",
              },
            ],
          },
        ],
      },
      {
        text: "Довідка API",
        link: "https://deno.land/x/grammy/mod.ts",
      },
    ],
  },
};

export const docsearchUk: LocaleConfig<DocsearchLocaleData> = {
  "/uk/": {
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
