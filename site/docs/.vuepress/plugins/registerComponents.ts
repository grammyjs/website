import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import { getDirname, path } from "@vuepress/utils";
import { type Plugin } from "vuepress-vite";

export function registerComponents(): Plugin {
  const __dirname = getDirname(import.meta.url);

  return registerComponentsPlugin({
    componentsDir: path.resolve(__dirname, "../components"),
  });
}
