import { type Plugin } from "vuepress-vite";

export function betterLineBreaks(): Plugin {
  return {
    name: "break-long-inline-code-snippets",
    extendsMarkdown: (md) => {
      md.renderer.rules.code_inline = (
        tokens,
        idx,
        _opts,
        _env,
        slf,
      ) => {
        const token = tokens[idx];
        const attributes = slf.renderAttrs(token);
        const withBreaks = insertWbrTags(token.content);
        const escaped = escapeHtml(withBreaks);
        return `<code${attributes}>${escaped}</code>`;
      };
    },
  };
}

// Adapted from original `code_inline` implementation of markdown-it.
const HTML_ESCAPE_TEST_RE = /&|<(?!wbr>)|(?<!<wbr)>/;
const HTML_ESCAPE_REPLACE_RE = /&|<(?!wbr>)|(?<!<wbr)>/g;
const HTML_REPLACEMENTS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};
function replaceUnsafeChar(ch: string) {
  return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str: string) {
  return HTML_ESCAPE_TEST_RE.test(str)
    ? str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)
    : str;
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
