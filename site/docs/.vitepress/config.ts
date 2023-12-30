import { defineConfig } from "vitepress";
import * as locale from "./configs/locales/index.js";
import { markdown } from "./plugins/index.js";
import { algolia } from "./configs/algolia/index.js";
import plaintext from "./shared/syntaxes/plaintext.tmLanguage.json";

export default defineConfig({
  lastUpdated: true,
  cleanUrls: true,
  cacheDir: ".vitepress/cache",
  outDir: ".vitepress/dist",

  locales: {
    ...locale.siteEn,
    ...locale.siteEs,
    ...locale.siteId,
    ...locale.siteUk,
    ...locale.siteZh,
  },

  themeConfig: {
    logo: "/images/Y.svg",
    siteTitle: "grammY",
    externalLinkIcon: true,
    search: algolia,
  },

  rewrites: {
    // Regex bug - https://github.com/vuejs/vitepress/discussions/1942
    ":foo/:bar/README.md": ":foo/:bar/index.md",
    ":foo/README.md": ":foo/index.md",
    "README.md": "index.md",
  },

  markdown: {
    lineNumbers: true,
    typographer: true,
    config: markdown,
    languages: [
      {
        // fallback unsupported syntaxes to txt
        aliases: ["asciiart", "ascii", "ftl", "log", "procfile", "text"],
        ...plaintext,
      },
    ],
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 1600,
    },
  },
});
