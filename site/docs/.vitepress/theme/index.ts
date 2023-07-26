import DefaultTheme from "vitepress/theme-without-fonts";
import Layout from "./layout/Layout.vue";
import "./style/index.scss";
import type { EnhanceAppContext } from "vitepress";

import HomeContent from "../components/HomeContent.vue";
import ThankYou from "../components/ThankYou.vue";
import LanguagePopup from "../components/LanguagePopup.vue";

export default {
  ...DefaultTheme,
  Layout: Layout,

  enhanceApp(ctx: EnhanceAppContext) {
    ctx.app.component("HomeContent", HomeContent);
    ctx.app.component("ThankYou", ThankYou);
    ctx.app.component("LanguagePopup", LanguagePopup);
  },
};
