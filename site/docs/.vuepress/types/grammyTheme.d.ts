import type {
  DefaultThemeLocaleOptions,
  DefaultThemePluginsOptions,
} from "./shared/index";

interface DefaultThemeOptions extends DefaultThemeLocaleOptions {
  /**
   * To avoid confusion with the root `plugins` option,
   * we use `themePlugins`
   */
  themePlugins?: DefaultThemePluginsOptions;
}

export default interface GrammyThemeOptions extends DefaultThemeOptions {}
