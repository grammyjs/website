import type { DocSearchProps } from "node_modules/vitepress/types/docsearch.js";
import type { LocaleConfig } from "vitepress";
import { social } from "../../shared/vars.js";

const learnGuide = {
  text: "Panduan",
  items: [
    {
      text: "Gambaran Umum",
      link: "/id/guide/",
      activeMatch: "^/id/guide/$",
    },
    {
      text: "Pengenalan",
      link: "/id/guide/introduction",
    },
    {
      text: "Memulai",
      link: "/id/guide/getting-started",
    },
    {
      text: "Mengirim dan Menerima Pesan",
      link: "/id/guide/basics",
    },
    {
      text: "Context",
      link: "/id/guide/context",
    },
    {
      text: "API Bot",
      link: "/id/guide/api",
    },
    {
      text: "Filter Query dan bot.on()",
      link: "/id/guide/filter-queries",
    },
    {
      text: "Command",
      link: "/id/guide/commands",
    },
    {
      text: "Reaksi",
      link: "/id/guide/reactions",
    },
    {
      text: "Middleware",
      link: "/id/guide/middleware",
    },
    {
      text: "Menangani Error",
      link: "/id/guide/errors",
    },
    {
      text: "Menangani File",
      link: "/id/guide/files",
    },
    {
      text: "Game",
      link: "/id/guide/games",
    },
    {
      text: "Long Polling vs. Webhook",
      link: "/id/guide/deployment-types",
    },
  ],
};
const learnAdvanced = {
  text: "Tingkat Lanjut",
  items: [
    {
      text: "Gambaran Umum",
      link: "/id/advanced/",
      activeMatch: "^/id/advanced/$",
    },
    {
      text: "Membangkitkan Middleware",
      link: "/id/advanced/middleware",
    },
    {
      text: "Peningkatan I: Codebase Skala Besar",
      link: "/id/advanced/structuring",
    },
    {
      text: "Peningkatan II: Beban Kerja Tinggi",
      link: "/id/advanced/scaling",
    },
    {
      text: "Peningkatan III: Reliabilitas",
      link: "/id/advanced/reliability",
    },
    {
      text: "Peningkatan IV: Pembatasan Flood",
      link: "/id/advanced/flood",
    },
    {
      text: "Transformer API Bot",
      link: "/id/advanced/transformers",
    },
    {
      text: "Telegram Business",
      link: "/id/advanced/business",
    },
    {
      text: "Dukungan Proxy",
      link: "/id/advanced/proxy",
    },
    {
      text: "Daftar Periksa Deployment",
      link: "/id/advanced/deployment",
    },
  ],
};

const pluginIntroduction = {
  text: "Pendahuluan",
  items: [
    {
      text: "Tentang Plugin",
      link: "/id/plugins/",
      activeMatch: "^/id/plugins/$",
    },
    {
      text: "Cara Membuat Plugin",
      link: "/id/plugins/guide",
    },
  ],
};
const pluginBuiltin = {
  text: "Bawaan",
  items: [
    {
      text: "Session dan Penyimpanan Data",
      link: "/id/plugins/session",
    },
    {
      text: "Keyboard Custom dan Inline",
      link: "/id/plugins/keyboard",
    },
    {
      text: "Pengelompokan Media",
      link: "/id/plugins/media-group",
    },
    {
      text: "Inline Query",
      link: "/id/plugins/inline-query",
    },
  ],
};
const pluginOfficial = {
  text: "Resmi",
  items: [
    {
      text: "Percakapan (conversations)",
      link: "/id/plugins/conversations",
    },
    {
      text: "Menu Interaktif (menu)",
      link: "/id/plugins/menu",
    },
    {
      text: "Stateless Question (stateless-question)",
      link: "/id/plugins/stateless-question",
    },
    {
      text: "Concurrency (runner)",
      link: "/id/plugins/runner",
    },
    {
      text: "Hidrasi (hydrate)",
      link: "/id/plugins/hydrate",
    },
    {
      text: "Pengulang Request Api (auto-retry)",
      link: "/id/plugins/auto-retry",
    },
    {
      text: "Kontrol Flood (transformer-throttler)",
      link: "/id/plugins/transformer-throttler",
    },
    {
      text: "Rate Limit Pengguna (ratelimiter)",
      link: "/id/plugins/ratelimiter",
    },
    {
      text: "File (files)",
      link: "/id/plugins/files",
    },
    {
      text: "Internationalization (i18n)",
      link: "/id/plugins/i18n",
    },
    {
      text: "Internationalization (fluent)",
      link: "/id/plugins/fluent",
    },
    {
      text: "Router (router)",
      link: "/id/plugins/router",
    },
    {
      text: "Emoji (emoji)",
      link: "/id/plugins/emoji",
    },
    {
      text: "Parse Mode (parse-mode)",
      link: "/id/plugins/parse-mode",
    },
    {
      text: "Chat Members (chat-members)",
      link: "/id/plugins/chat-members",
    },
  ],
};
const pluginThirdparty = {
  text: "Pihak Ketiga",
  items: [
    {
      text: "Console Time",
      link: "/id/plugins/console-time",
    },
    {
      text: "Kumpulan Middleware yang Berguna",
      link: "/id/plugins/middlewares",
    },
    {
      text: "Autoquote",
      link: "/id/plugins/autoquote",
    },
    {
      text: "[Kirim PR-mu!]",
      link: "/id/plugins/#buat-plugin-mu-sendiri",
    },
  ],
};

const resourcesGrammy = {
  text: "grammY",
  items: [
    {
      text: "Tentang grammY",
      link: "/id/resources/about",
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
      link: "/id/resources/faq",
    },
    {
      text: "Perbandingan dengan Framework Lainnya",
      link: "/id/resources/comparison",
    },
  ],
};

const resourcesTelegram = {
  text: "Telegram",
  items: [
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
};

const resourcesTools = {
  text: "Peralatan",
  items: [
    {
      text: "telegram.tools",
      link: "https://telegram.tools",
    },
    {
      text: "Ekstensi VS Code",
      link: "https://github.com/grammyjs/vscode",
    },
  ],
};

const hostingOverview = {
  text: "Gambaran Umum",
  items: [
    {
      text: "Perbandingan",
      link: "/id/hosting/comparison",
    },
  ],
};
const hostingTutorials = {
  text: "Tutorial",
  items: [
    {
      text: "Virtual Private Server (VPS)",
      link: "/id/hosting/vps",
    },
    {
      text: "Deno Deploy",
      link: "/id/hosting/deno-deploy",
    },
    {
      text: "Supabase Edge Functions",
      link: "/id/hosting/supabase",
    },
    {
      text: "Cloudflare Workers (Deno)",
      link: "/id/hosting/cloudflare-workers",
    },
    {
      text: "Cloudflare Workers (Node.js)",
      link: "/id/hosting/cloudflare-workers-nodejs",
    },
    {
      text: "Fly",
      link: "/id/hosting/fly",
    },
    {
      text: "Firebase Functions",
      link: "/id/hosting/firebase",
    },
    {
      text: "Vercel",
      link: "/id/hosting/vercel",
    },
    {
      text: "Zeabur (Deno)",
      link: "/id/hosting/zeabur-deno",
    },
    {
      text: "Zeabur (Node.js)",
      link: "/id/hosting/zeabur-nodejs",
    },
    {
      text: "Heroku",
      link: "/id/hosting/heroku",
    },
  ],
};
export const siteId: LocaleConfig = {
  id: {
    label: "Indonesia",
    lang: "id",
    title: "grammY",
    description: "Framework Bot Telegram.",
    themeConfig: {
      nav: [
        { text: "Panduan", link: "/id/guide/" },
        {
          text: "Belajar",
          items: [learnGuide, learnAdvanced],
        },
        {
          text: "Plugin",
          items: [
            pluginIntroduction,
            pluginBuiltin,
            pluginOfficial,
            pluginThirdparty,
          ],
        },
        {
          text: "Contoh",
          items: [
            {
              text: "Contoh",
              items: [
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
          items: [resourcesGrammy, resourcesTelegram, resourcesTools],
        },
        {
          text: "Hosting",
          items: [hostingOverview, hostingTutorials],
        },
        {
          text: "Referensi API",
          link: "/ref/",
        },
      ],
      sidebar: {
        "/id/guide/": [
          { collapsed: false, ...learnGuide },
          { collapsed: true, ...learnAdvanced },
        ],
        "/id/advanced/": [
          { collapsed: true, ...learnGuide },
          { collapsed: false, ...learnAdvanced },
        ],
        "/id/plugins/": [
          { collapsed: false, ...pluginIntroduction },
          { collapsed: false, ...pluginBuiltin },
          { collapsed: false, ...pluginOfficial },
          { collapsed: false, ...pluginThirdparty },
        ],
        "/id/resources/": [
          { collapsed: false, ...resourcesGrammy },
          { collapsed: false, ...resourcesTelegram },
        ],
        "/id/hosting/": [
          { collapsed: false, ...hostingOverview },
          { collapsed: false, ...hostingTutorials },
        ],
      },
      outline: {
        level: [2, 6],
        label: "Di halaman ini",
      },
      editLink: {
        text: "Ubah halaman ini di GitHub",
        pattern:
          "https://github.com/grammyjs/website/edit/main/site/docs/:path",
      },
      docFooter: {
        prev: "Halaman sebelumnya",
        next: "Halaman selanjutnya",
      },
      lastUpdatedText: "Terakhir diperbarui",
      darkModeSwitchLabel: "Tampilan", // only displayed in the mobile view.
      sidebarMenuLabel: "Menu", // only displayed in the mobile view.
      returnToTopLabel: "Kembali ke atas", // only displayed in the mobile view.
      langMenuLabel: "Ubah bahasa", // Aria-label
      socialLinks: [
        {
          link: social.telegram.link,
          icon: {
            svg: social.telegram.icon,
          },
          ariaLabel: "Link grup telegram grammY",
        },
        {
          link: social.github.link,
          icon: social.github.icon,
          ariaLabel: "Link repositori grammY",
        },
      ],
      notFound: {
        code: "404",
        title: "HALAMAN TIDAK DITEMUKAN",
        linkText: "Putar balik, guys!",
        linkLabel: "Pergi ke beranda",
        messages: [
          "Halaman tak bertuan.",
          "Zonk!",
          "Maaf, tidak ada apa-apa di sini.",
          "Perjalanan ini \nTerasa sangat menyedihkan",
          "Hey, Google! \nTunjukkan jalan ke halaman yang saya cari",
          "Belum beruntung. Coba lagi.",
          "Pat nol pat peg not fon.",
        ],
      },
    },
  },
};
export const searchId: Record<string, Partial<DocSearchProps>> = {
  id: {
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
