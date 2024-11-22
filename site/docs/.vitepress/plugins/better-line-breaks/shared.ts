// Adapted from original `code_inline` implementation of markdown-it.
const HTML_ENTITY_TEST_RE = /&[a-zA-Z0-9#]+;/;
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
export function escapeHtml(str: string) {
  // Skip escaping if the string contains valid HTML entities (e.g., &middot;)
  if (HTML_ENTITY_TEST_RE.test(str)) return str;

  return HTML_ESCAPE_TEST_RE.test(str)
    ? str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)
    : str;
}
