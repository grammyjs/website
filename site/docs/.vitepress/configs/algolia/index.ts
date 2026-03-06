import type { DefaultTheme } from "vitepress";
import * as locale from "../locales/index.js";

export const algolia: DefaultTheme.Config["search"] = {
  provider: "algolia",
  options: {
    apiKey: "33782ffb584887e3b8cdf9e760ea8e60",
    indexName: "grammy",
    appId: "RBF5Q0D7QV",
    // Prefer docs over API reference without excluding /ref hits.
    searchParameters: {
      optionalFilters: ["contentCategory:docs"],
    },
    locales: {
      ...locale.searchEn,
      ...locale.searchEs,
      ...locale.searchId,
      ...locale.searchUk,
      ...locale.searchZh,
    },
  },
};
