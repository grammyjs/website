import { createDefaultMapFromNodeModules } from "@typescript/vfs";
import type MarkdownIt from "markdown-it";
import { setupForFile, transformAttributesToHTML } from "remark-shiki-twoslash";
import type { UserConfigSettings } from "shiki-twoslash";

const libMap = {
  grammy_autoquote: "@roziscoding/grammy-autoquote",
};

// Loads type definitions from installed libraries
// We can inject other type definitions as shown here:
// https://github.com/microsoft/TypeScript-Website/issues/513#issuecomment-613522891
const fsMap = createDefaultMapFromNodeModules({});

const highlight = (
  code: string,
  lang: string,
  attrs: string,
  highlighters: Awaited<ReturnType<typeof setupForFile>>["highlighters"],
  settings: UserConfigSettings,
) => {
  try {
    return transformAttributesToHTML(
      code,
      [lang, attrs].join(" "),
      highlighters,
      {
        fsMap,
        ...settings,
      }!,
    );
  } catch (err) {
    return `${err}`;
  }
};

export default (settings: UserConfigSettings) => ({
  name: "vuepress-plugin-shiki-twoslash",
  extendsMarkdown: async (md: MarkdownIt) => {
    const { highlighters } = await setupForFile(settings);
    md.options.highlight = (code, lang, attrs) => {
      code = code.replace(/\r?\n$/, ""); // strip trailing newline fed during code block parsing

      if (!attrs.includes("twoslash")) {
        return highlight(code, lang, attrs, highlighters, settings);
      }

      const importRegex =
        /(^import ?(?<imports>[^;]+)(?: ?)from (?<id>(?:'|")[^'"]+(?:'|"));?$)/img;

      const imports = code.match(importRegex);

      if (!imports || !imports.some((i) => i.includes('.ts"'))) {
        return highlight(code, lang, attrs, highlighters, settings);
      }

      const lines = imports.map((i) => {
        const urlMatch = /(?:"|')([^"']+)(?:"|')/.exec(i);

        /** If we can't find and extract the URL, return unaltered line */
        if (!urlMatch || !urlMatch[0] || !urlMatch[1]) return i;

        const url = urlMatch[1];

        const idMatch = url.match(/https:\/\/deno\.land\/x\/([^@]+)/i);

        /** If we can't find and extract the URL, return unaltered line */
        if (!idMatch || !idMatch[0] || !idMatch[1]) return i;

        const id = idMatch[1];

        return i.replace(url, id in libMap ? libMap[id] : id);
      }).concat([
        "// ---cut---",
        code.replace(importRegex, "//REMOVETHIS$1"),
      ]);

      console.log(lines.join("\n"));

      const result = highlight(
        lines.join("\n"),
        lang,
        attrs,
        highlighters,
        settings,
      ).replace(/\/\/REMOVETHIS/ig, "");

      console.log(result);

      return result;
    };
  },
});
