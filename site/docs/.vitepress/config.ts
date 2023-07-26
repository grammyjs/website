import { defineConfig } from "vitepress";
import * as locale from "./configs/locales";
import { markdown } from "./plugins";
import path from "path";
import { algolia } from "./configs/algolia";

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
    logo: "/images/Y.webp",
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
