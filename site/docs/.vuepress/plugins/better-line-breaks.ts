import { type Plugin } from "vuepress-vite";
import { escapeHtml } from "./shared";

export function betterLineBreaks(): Plugin {
  return {
    name: "better-line-breaks",
    extendsMarkdown: (md) => {
      md.renderer.rules.text = (tokens, idx) => {
        let content = tokens[idx].content;
        if (
          tokens[idx - 1]?.type === "link_open" &&
          tokens[idx + 1]?.type === "link_close"
        ) {
          content = insertWbrTags(content);
        }
        const escaped = escapeHtml(content);
        return escaped;
      };
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
          // Insert a word break opportunity after a colon, equals sign, or ambersand
          .replace(/(?<after>[:=&])(.)/giu, "$1<wbr>$2")
          // Before a single slash, tilde, period, comma, hyphen, underline, question mark, number sign, percent symbol, equals sign, or ambersand
          .replace(/(.)(?<before>[/~.,\-_?#%=&])/giu, "$1<wbr>$2")
          // Between words in camelCase
          .replace(/([a-z]+)(([A-Z][a-z])+)/gu, "$1<wbr>$2"),
    )
    // Reconnect the strings with word break opportunities after double slashes
    .join("//<wbr>");
}
