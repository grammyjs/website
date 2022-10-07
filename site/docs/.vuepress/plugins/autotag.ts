import type { Plugin } from "vuepress-vite";
import type { AutotagOptions } from "../types";

/**
 * Inject Tag component to every first level of heading
 *
 * @result
 * ```html
 * <h1>...</h1>
 * <AutoTag/>
 * ```
 */
export function autotag(option: AutotagOptions): Plugin {
  return {
    name: "autotag",
    extendsMarkdown: (md) => {
      // Filter only the closing tag.
      md.renderer.rules.heading_close = (tokens, idx) => {
        const closingTag = `</${tokens[idx].tag}>`; // Closing tag, ex: "</h1>", "</h2>", etc ;
        const optionString = JSON.stringify(option);

        // Insert Tag component
        // and user option to Tag attributes.
        return tokens[idx].tag === "h1"
          ? closingTag + `<TagAuto config='${optionString}'/>`
          : closingTag;
      };
    },
  };
}
