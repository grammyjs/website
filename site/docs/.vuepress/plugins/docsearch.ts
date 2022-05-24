import {
  type DocsearchOptions,
  docsearchPlugin,
} from "@vuepress/plugin-docsearch";

export function docsearch(locales: DocsearchOptions["locales"]) {
  return docsearchPlugin({
    apiKey: "33782ffb584887e3b8cdf9e760ea8e60",
    indexName: "grammy",
    appId: "RBF5Q0D7QV",
    placeholder: "Search",
    locales,
  });
}
