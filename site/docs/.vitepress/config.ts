import { defineConfig } from "vitepress";
import * as config from "./configs";

export default defineConfig({
  lastUpdated: true,
  appearance: "dark",
  cleanUrls: true,

  locales: {
    ...config.siteEn,
    ...config.siteEs,
    ...config.siteId,
    ...config.siteUk,
    ...config.siteZh,
  },

  themeConfig: {
    logo: "/images/Y.webp",
    siteTitle: "grammY",
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: config.searchEn,
          },
          es: {
            translations: config.searchEs,
          },
          id: {
            translations: config.searchId,
          },
          uk: {
            translations: config.searchUk,
          },
          zh: {
            translations: config.searchZh,
          },
        },
      },
    },
  },

  rewrites: {
    // Regex bug - https://github.com/vuejs/vitepress/discussions/1942
    ":foo/:bar/README.md": ":foo/:bar/index.md",
    ":foo/README.md": ":foo/index.md",
    "README.md": "index.md",
  },

  markdown: {
    lineNumbers: true,
    theme: "dracula-soft",
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 1600,
    },
  },
});
