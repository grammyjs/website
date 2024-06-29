import { defineConfig } from "vitepress";
import { algolia } from "./configs/algolia/index.js";
import * as locale from "./configs/locales/index.js";
import { markdown } from "./plugins/index.js";
import plaintext from "./shared/syntaxes/plaintext.tmLanguage.json";
import env from "./shared/syntaxes/env.tmLanguage.json";

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
    ":foo/:bar/:baz/README.md": ":foo/:bar/:baz/index.md",
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
      env,
    ],
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 1600,
    },
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: `${import.meta.dirname}/components/NavBar.vue`,
        },
        {
          find: /^.*\/VPNavScreen\.vue$/,
          replacement: `${import.meta.dirname}/components/NavScreen.vue`,
        },
        {
          find: /^.*\/VPNavBarExtra\.vue$/,
          replacement: `${import.meta.dirname}/components/NavBarExtra.vue`,
        },
      ],
    },
  },
});
