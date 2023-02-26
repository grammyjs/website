import "@mdi/font/css/materialdesignicons.css";
import { defineClientConfig } from "@vuepress/client";
import { defineAsyncComponent } from "vue";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "vuetify/styles";

export default defineClientConfig({
  enhance({ app }) {
    const vuetify = createVuetify({
      theme: {
        defaultTheme: 'dark',
        themes: {
          dark: {
            dark: true,
            colors: {
              primary: '#009dcaFF',
              background: '#38404a',
              surface: '#38404AFF',
            }
          }
        }
      },
      ssr: true,
      aliases,
      icons: {
        defaultSet: "mdi",
        sets: {
          mdi,
        },
      },
    });

    app.use(vuetify);

    app.component(
      "WebhookUtil",
      defineAsyncComponent(() =>
        import("./components/webhook-util/WebhookUtil.vue")
      ),
    );
  },
});
