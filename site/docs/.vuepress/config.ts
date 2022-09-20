import { defaultTheme, defineUserConfig } from "vuepress-vite";
import {
  docsearchEn,
  docsearchEs,
  docsearchId,
  docsearchZh,
  localeEn,
  localeEs,
  localeId,
  localeZh,
  siteEn,
  siteEs,
  siteId,
  siteZh,
} from "./configs";
import { betterLineBreaks } from "./plugins/better-line-breaks";
import { currentVersions } from "./plugins/current-versions/plugin";
import { docsearch } from "./plugins/docsearch";

export default defineUserConfig({
  locales: {
    ...siteEn,
    ...siteEs,
    ...siteId,
    ...siteZh,
  },
  shouldPrefetch: true,

  theme: defaultTheme({
    logo: "/Y.png",
    locales: {
      ...localeEn,
      ...localeEs,
      ...localeId,
      ...localeZh,
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
      ...docsearchEn,
      ...docsearchEs,
      ...docsearchId,
      ...docsearchZh,
    }),
    betterLineBreaks(),
    currentVersions(),
  ],
  markdown: {
    typographer: true,
  },
});
