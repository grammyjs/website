import type { DefaultTheme } from "vitepress";
import * as locale from "../locales";

export const algolia: DefaultTheme.Config["search"] = {
  provider: "algolia",
  options: {
    apiKey: "33782ffb584887e3b8cdf9e760ea8e60",
    indexName: "grammy",
    appId: "RBF5Q0D7QV",
    locales: {
      ...locale.searchEn,
      ...locale.searchEs,
      ...locale.searchId,
      ...locale.searchUk,
      ...locale.searchZh,
    },
  },
};
