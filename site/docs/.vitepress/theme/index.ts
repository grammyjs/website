import DefaultTheme from "vitepress/theme-without-fonts";
import Layout from "./layout/Layout.vue";
import "./style/index.scss";
import type { EnhanceAppContext } from "vitepress";

import ThankYou from "../components/ThankYou.vue";
import LanguagePopup from "../components/LanguagePopup.vue";
import NotFound from "../components/NotFound.vue";

export default {
  ...DefaultTheme,
  Layout: Layout,

  enhanceApp(ctx: EnhanceAppContext) {
    ctx.app.component("ThankYou", ThankYou);
    ctx.app.component("LanguagePopup", LanguagePopup);
    ctx.app.component("NotFound", NotFound);
  },
};
