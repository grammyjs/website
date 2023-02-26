import { defaultTheme, defineUserConfig, viteBundler } from "vuepress-vite";
import * as config from "./configs";
import { betterLineBreaks } from "./plugins/better-line-breaks";
import { currentVersions } from "./plugins/current-versions/plugin";
import { docsearch } from "./plugins/docsearch";

export default defineUserConfig({
  locales: {
    ...config.siteEn,
    ...config.siteEs,
    ...config.siteId,
  },
  shouldPrefetch: true,
  bundler: viteBundler({
    viteOptions: {
      ssr: {
        noExternal: ['vuetify']
      }
    }
  }),
  theme: defaultTheme({
    logo: "/images/Y.png",
    locales: {
      ...config.localeEn,
      ...config.localeEs,
      ...config.localeId,
    },
    repo: "https://github.com/grammyjs/grammY",
    docsRepo: "https://github.com/grammyjs/website",
    docsDir: "site/docs",
    docsBranch: "main",
    editLink: true,
    editLinkPattern: ":repo/edit/:branch/:path",
    repoLabel: "GitHub",
  }),

  plugins: [
    docsearch({
      ...config.docsearchEn,
      ...config.docsearchEs,
      ...config.docsearchId,
    }),
    betterLineBreaks(),
    currentVersions(),
  ],

  markdown: {
    typographer: true,
  },
});
