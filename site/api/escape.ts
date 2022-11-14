const replace: Record<string, string> = {
  "<": "&lt;",
  "&": "&amp;",
};

export function escapeHtmlInMarkdown(source: string): string {
  const chars = source.split("");
  let pre = false, code = false;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === "`") {
      if (chars[i + 1] === "`" && chars[i + 2] === "`") {
        pre = !pre;
      } else if (!pre) {
        code = !code;
      }
    }
    if (!pre && !code && c in replace) {
      chars[i] = replace[c];
    }
  }
  return chars.join("");
}
