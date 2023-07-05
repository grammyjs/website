import MarkdownIt from "markdown-it";

const PROBLEM_CHARS_TEST_RE = /[йїáéíóñú_]/g;
const replacements: Record<string, string> = {
  й: "и",
  ї: "і",
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ñ: "n",
  ú: "u",
  _: "-",
};
export const betterAnchors = (md: MarkdownIt)=> {
  md.inline.ruler.before("text", "better-anchors", (state) => {
    state.tokens.forEach((token) => {
      if (token.type !== "link_open") return;
      const href = token.attrGet("href");
      if (href === null || !/^[\.#]/.test(href)) return;
      const { 0: base, 1: anchor } = href.split("#");
      if (anchor === undefined) return;
      const newHref = `${base}#${
        encodeURI(
          decodeURI(anchor)
            .replace(
              PROBLEM_CHARS_TEST_RE,
              (ch: string) => replacements[ch],
            )
            .replace("nodejs", "node.js"),
        )
      }`;
      token.attrSet("href", newHref);
    });
    return false;
  });
}