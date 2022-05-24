import { type Plugin } from "vuepress-vite";
import imports from "./index.json" assert { type: "json" };

export function currentVersions(): Plugin {
  return {
    name: "current-versions",
    extendsMarkdown: (md) => {
      const oldFence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const oldHighlight = options.highlight;
        options.highlight = (str, lang, attrs) => {
          for (const [source, target] of Object.entries(imports)) {
            str = str.replace(source, target);
          }
          return oldHighlight(str, lang, attrs);
        };
        return oldFence(tokens, idx, options, env, slf);
      };
    },
  };
}
