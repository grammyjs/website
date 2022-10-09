import type { Theme } from "@vuepress/core";
import { defaultTheme } from "@vuepress/theme-default";
import { getDirname, path } from "@vuepress/utils";
import type GrammyThemeOptions from "../types/grammyTheme";

const __dirname = getDirname(import.meta.url);
export const grammyTheme = (options: GrammyThemeOptions): Theme => {
  return {
    name: "grammyTheme",
    extends: defaultTheme(options),
    define: {
      // Define global constants to be used by AutotagMenu component.
      __NAVBAR_CONFIG__: options.locales?.["/"].navbar, // Get navbar config for locale "EN"
    },
    alias: {
      "@theme/AutoLink.vue": path.resolve(
        __dirname,
        "./components/AutoLink.vue",
      ),
      "@theme/NavbarDropdown.vue": path.resolve(
        __dirname,
        "./components/NavbarDropdown.vue",
      ),
      "@theme/NavbarItems.vue": path.resolve(
        __dirname,
        "./components/NavbarItems.vue",
      ),
      /**
       * Missing exports in default-theme
       * see https://github.com/vuepress/vuepress-next/issues/1068#issuecomment-1235000579
       */
      "~/composables/index.js": path.resolve(
        __dirname,
        "../../../node_modules/@vuepress/theme-default/lib/client/composables/index.js",
      ),
      "~/utils/index.js": path.resolve(
        __dirname,
        "../../../node_modules/@vuepress/theme-default/lib/client/utils/index.js",
      ),
    },
  };
};
