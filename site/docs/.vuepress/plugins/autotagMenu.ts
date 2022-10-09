import type { Plugin } from "vuepress-vite";
import type { AutotagMenuOptions } from "../types";

export function autotagMenu(option: AutotagMenuOptions): Plugin {
  return {
    name: "autotagMenu",
    define: {
      __AUTOTAGMENU_CONFIG__: option, // Define global constants to be used by AutotagMenu component.
    },
  };
}
