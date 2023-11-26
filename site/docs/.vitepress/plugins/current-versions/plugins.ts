import imports from "./index.json" assert { type: "json" };
import MarkdownIt from "markdown-it";

export const currentVersions = (md: MarkdownIt) => {
  const oldFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const oldHighlight = options.highlight;

    options.highlight = (str, lang, attrs) => {
      for (const [source, target] of Object.entries(imports)) {
        str = str.replace(source, target);
      }

      return oldHighlight ? oldHighlight(str, lang, attrs) : "";
    };

    return oldFence ? oldFence(tokens, idx, options, env, slf) : "";
  };
};
