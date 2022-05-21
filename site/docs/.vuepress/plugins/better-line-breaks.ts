import { type Plugin } from "vuepress-vite";
import { escapeHtml } from "./shared";

export function betterLineBreaks(): Plugin {
  return {
    name: "better-line-breaks",
    extendsMarkdown: (md) => {

      md.renderer.rules.code_inline = (tokens, idx, _opts, _env, slf) => {
        const token = tokens[idx];
        const attributes = slf.renderAttrs(token);
        const withBreaks = insertWbrTags(token.content);
        const escaped = escapeHtml(withBreaks);
        return `<code${attributes}>${escaped}</code>`;
      };
    },
  };
}

function insertWbrTags(url: string) {
  // Adapted from https://css-tricks.com/better-line-breaks-for-long-urls/
  return url
    .split("//")
    .map(
      (str) =>
        str
          // Insert a word break opportunity after a colon
          .replace(/(?<after>:)/giu, "$1<wbr>")
          // Before a single slash, tilde, period, comma, hyphen, underline, question mark, number sign, or percent symbol
          .replace(/(?<before>[/~.,\-_?#%])/giu, "<wbr>$1")
          // Before and after an equals sign or ampersand
          .replace(/(?<beforeAndAfter>[=&])/giu, "<wbr>$1<wbr>"),
    )
    // Reconnect the strings with word break opportunities after double slashes
    .join("//<wbr>");
}
