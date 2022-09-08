import type MarkdownIt from "markdown-it";
import { setupForFile, transformAttributesToHTML } from "remark-shiki-twoslash";
import type { UserConfigSettings } from "shiki-twoslash";

const libMap = {
  grammy_autoquote: "@roziscoding/grammy-autoquote",
};

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
      settings,
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
      const skipTwoslash = !attrs.includes("twoslash");

      if (skipTwoslash) {
        return highlight(code, lang, attrs, highlighters, settings);
      }

      const importRegex =
        /(^import ?(?<imports>[^;]+)(?: ?)from (?<id>(?:'|")[^'"]+(?:'|"));?$)/img;

      const imports = code.match(importRegex);

      if (!imports || !imports.some((i) => i.includes('.ts"'))) {
        return highlight(code, lang, attrs, highlighters, settings);
      }

      const replacedMap = new Map();

      imports.forEach((i) => {
        const urlMatch = /(?:"|')([^"']+)(?:"|')/.exec(i);

        /** If we can't find and extract the URL, return unaltered line */
        if (!urlMatch || !urlMatch[0] || !urlMatch[1]) return i;

        const url = urlMatch[1];

        const idMatch = url.match(/https:\/\/deno\.land\/x\/([^@]+)/i);

        /** If we can't find and extract the URL, return unaltered line */
        if (!idMatch || !idMatch[0] || !idMatch[1]) return i;

        const id = idMatch[1] in libMap ? libMap[idMatch[1]] : idMatch[1];

        replacedMap.set(id, url);

        code = code.replace(url, id);
      });

      let result = highlight(
        code,
        lang,
        attrs,
        highlighters,
        settings,
      );

      for (const [id, url] of replacedMap.entries()) {
        result = result.replace(id, url);
      }

      return result;
    };
  },
});
