import { defineClientConfig } from "@vuepress/client";
import { defineAsyncComponent } from "vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component(
      "ThankYou",
      defineAsyncComponent(() => import("./components/ThankYou.vue")),
    );
  },
});
