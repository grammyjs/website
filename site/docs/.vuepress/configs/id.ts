import type { DocsearchLocaleData } from "@vuepress/plugin-docsearch";
import type { DefaultThemeLocaleData } from "@vuepress/theme-default";
import type { LocaleConfig, SiteLocaleConfig } from "vuepress-vite";

export const siteId: SiteLocaleConfig = {
  "/id/": {
    lang: "id",
    title: "grammY",
    description: "Framework Bot Telegram.",
  },
};

export const localeId: LocaleConfig<DefaultThemeLocaleData> = {
  "/id/": {
    selectLanguageText: "🌏",
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
              {
                text: "Chat Members (chat-members)",
                link: "/id/plugins/chat-members.html",
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
                text: "Cloudflare Workers",
                link: "/id/hosting/cloudflare-workers.html",
              },
              {
                text: "Heroku",
                link: "/id/hosting/heroku.html",
              },
              {
                text: "Fly",
                link: "/id/hosting/fly.html",
              },
              {
                text: "Firebase Functions",
                link: "/id/hosting/firebase.html",
              },
              {
                text: "Google Cloud Functions",
                link: "/id/hosting/gcf.html",
              },
              {
                text: "Vercel",
                link: "/id/hosting/vercel.html",
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
        link: "https://deno.land/x/grammy/mod.ts",
      },
    ],
  },
};

export const docsearchId: LocaleConfig<DocsearchLocaleData> = {
  "/id/": {
    placeholder: "Cari",
    translations: {
      button: {
        buttonText: "Cari",
        buttonAriaLabel: "Cari",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "Hapus kueri",
          resetButtonAriaLabel: "Hapus kueri",
          cancelButtonText: "Batal",
          cancelButtonAriaLabel: "Batal",
        },
        startScreen: {
          recentSearchesTitle: "Terkini",
          noRecentSearchesText: "Belum ada pencarian terkini",
          saveRecentSearchButtonTitle: "Simpan pencarian ini",
          removeRecentSearchButtonTitle: "Hapus pencarian ini dari riwayat",
          favoriteSearchesTitle: "Favorit",
          removeFavoriteSearchButtonTitle: "Hapus pencarian ini dari favorit",
        },
        errorScreen: {
          titleText: "Pencarian gagal dilakukan",
          helpText: "Coba periksa koneksi internet kamu.",
        },
        footer: {
          selectText: "pilih",
          selectKeyAriaLabel: "tombol Enter",
          navigateText: "navigasi",
          navigateUpKeyAriaLabel: "Ke atas",
          navigateDownKeyAriaLabel: "Ke bawah",
          closeText: "tutup",
          closeKeyAriaLabel: "tombol Escape",
          searchByText: "Cari menggunakan",
        },
        noResultsScreen: {
          noResultsText: "Tidak ditemukan hasil untuk",
          suggestedQueryText: "Coba cari",
          reportMissingResultsText:
            "Apakah hasil kueri ini seharusnya tersedia?",
          reportMissingResultsLinkText: "Beritahu kami.",
        },
      },
    },
  },
};
