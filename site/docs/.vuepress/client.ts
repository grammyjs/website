import { defineAsyncComponent } from "vue";
import { defineClientConfig } from "@vuepress/client";

export default defineClientConfig({
  enhance({ app }) {
    app.component(
      "ThankYou",
      defineAsyncComponent(() => import("./components/ThankYou.vue")),
    );
  },
});
