import { defineConfig } from "vitepress";
import * as config from "./configs";
import { markdown } from "./plugins";
import path from "path";

export default defineConfig({
  lastUpdated: true,
  appearance: "dark",
  cleanUrls: true,
  cacheDir: "./site/docs/.vitepress/cache",

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
    typographer: true,
    config: markdown,
    languages: [
      {
        id: "plaintext",
        scopeName: "text.plain",
        path: path.resolve(
          __dirname,
          "./shared/shiki-languages/plaintext.tmLanguage.json",
        ),
        aliases: ["asciiart", "ascii", "text"],
      },
      {
        id: "procfile",
        scopeName: "source.procfile",
        path: path.resolve(
          __dirname,
          "./shared/shiki-languages/procfile.tmLanguage.json",
        ),
        aliases: ["Procfile", "procfile", ".procfile"],
      },
      {
        id: "log",
        scopeName: "text.log",
        path: path.resolve(
          __dirname,
          "./shared/shiki-languages/log.tmLanguage.json",
        ),
        aliases: ["log"],
      },
      {
        id: "fluent",
        scopeName: "source.ftl",
        path: path.resolve(
          __dirname,
          "./shared/shiki-languages/ftl.tmLanguage.json",
        ),
        aliases: ["ftl"],
      },
    ],
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 1600,
    },
  },
});
