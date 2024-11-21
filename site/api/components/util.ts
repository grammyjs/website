import { TsTypeParamDef } from "deno_doc/types.d.ts";
import { LinkGetter } from "./types.ts";

export function newGetLink(
  oldGetLink: (r: string) => string | null,
  typeParams: TsTypeParamDef[],
) {
  return (r: string) => {
    const l = oldGetLink(r);
    if (l == null) {
      if (typeParams.map((v) => v.name).includes(r)) {
        return "#" + r.toLowerCase();
      }
    }
    return l;
  };
}

export function replaceModuleSymbolLinks(
  text: string,
  getLink: LinkGetter,
  anchors: string[] | undefined,
) {
  return replaceSymbolLinks(text, (match) => {
    let [link, text] = match.split('|')
    text = text.trim()
    const [symbol, anchor] = link.trim().split(".");
    let href: string;
    if (anchors?.includes(symbol)) {
      href = `#${symbol}`;
    } else {
      href = getLink(symbol) ?? "";
      if (anchor) {
        href += `#${anchor}`;
      }
    }
    href = href.toLowerCase();
    return `[${text || match}](${href})`;
  });
}
function replaceSymbolLinks(
  text: string,
  replacer: (string: string) => string,
) {
  let newText = "";
  let stackActive = false;
  let stackExpects: "keyword" | "value" = "keyword";
  let stack = new Array<string>();
  let value = "";

  const flushStack = () => {
    stackExpects = "keyword";
    stackActive = false;
    value = "";
    for (const item of stack) {
      newText += item;
    }
    stack = [];
  };

  for (let i = 0; i < text.length; ++i) {
    const char = text[i];
    const prevChar = text[i - 1] || "";
    if (char == "{" && prevChar != "\\") {
      stackActive = true;
      stack.push(char);
      continue;
    }
    if (stackActive) {
      stack.push(char);
    } else {
      newText += char;
    }
    if (stackActive && stackExpects == "keyword") {
      if (/\s/.test(char)) {
        continue;
      }
      if (text.slice(i, i + "@link ".length) != "@link ") {
        flushStack();
      } else {
        stackExpects = "value";
        i += "@link ".length - 1;
        continue;
      }
    }
    if (stackExpects == "value" && char == "}" && prevChar != "\\") {
      value = value.trim();
      newText += replacer(value);
      stack = [];
      flushStack();
      continue;
    }
    if (stackExpects == "value") {
      value += char;
    }
  }

  return newText;
}
