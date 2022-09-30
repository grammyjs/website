import type { Theme } from "@vuepress/core";
import { defaultTheme } from "@vuepress/theme-default";
import { getDirname, path } from "@vuepress/utils";
import type GrammyThemeOptions from "../types/grammyTheme";

const __dirname = getDirname(import.meta.url);

export const grammyTheme = (options: GrammyThemeOptions): Theme => {
  return {
    name: "grammyTheme",
    extends: defaultTheme(options),
    alias: {
      "@theme/AutoLink.vue": path.resolve(
        __dirname,
        "./components/AutoLink.vue",
      ),
      "@theme/NavbarDropdown.vue": path.resolve(
        __dirname,
        "./components/NavbarDropdown.vue",
      ),
    },
  };
};
