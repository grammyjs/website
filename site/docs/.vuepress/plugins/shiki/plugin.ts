import { setupForFile, transformAttributesToHTML } from "remark-shiki-twoslash";
import { UserConfigSettings } from "shiki-twoslash";
import { type Plugin } from "vuepress-vite";
import { idsToUrls, urlsToIds } from "./convert-imports";

function setup(settings: UserConfigSettings) {
  return setupForFile(settings).then(({ highlighters }) => highlighters);
}

class ShikiTwoslash {
  constructor(
    private readonly highlighters: Awaited<
      ReturnType<typeof setupForFile>
    >["highlighters"],
    private readonly settings: UserConfigSettings,
  ) {}

  highlight(code: string, attrs: string) {
    code = code.replace(/\r?\n$/, ""); // strip trailing newline fed during code block parsing

    const enableTwoslash = attrs.includes("twoslash");

    if (!enableTwoslash) return this.highlightOnly(code, attrs);

    const result = this.replaceAndHighlight(code, attrs);

    return result;
  }

  highlightOnly(code: string, attrs: string) {
    try {
      return transformAttributesToHTML(
        code,
        attrs,
        this.highlighters,
        this.settings,
      );
    } catch (err) {
      return `<pre class="shiki error"><div class="code-container"><code>${err}</code></div></pre>`;
    }
  }

  replaceAndHighlight(code: string, attrs: string) {
    const [replacedCode, replacedMap] = urlsToIds(code);

    const highlightedCode = this.highlightOnly(replacedCode, attrs);

    return highlightedCode.startsWith('<pre class="shiki error"')
      ? highlightedCode
      : idsToUrls(highlightedCode, replacedMap);
  }
}

let shikiTwoslash: ShikiTwoslash;

export function shikiHighlight(settings: UserConfigSettings): Plugin {
  return {
    name: "better-code-groups",
    extendsMarkdown: async (md) => {
      shikiTwoslash = shikiTwoslash ||
        new ShikiTwoslash(await setup(settings), settings);

      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const { content, info } = token;
        const params = info.split(" ");

        if (!params.includes("codegroup")) {
          // If this is not a code group, skip
          return shikiTwoslash.highlight(token.content, token.info);
        }

        const tabs = content
          .trim()
          .split("// @tab ")
          .filter((x) => !!x)
          .map((tabContent) => {
            const [firstLine, ...lines] = tabContent.split("\n");

            const [tabTitle = "", ...tabInfo] = firstLine.split(" ");

            return [
              tabTitle,
              shikiTwoslash.highlight(
                lines.join("\n").trim(),
                tabInfo.join(" "),
              ),
            ];
          })
          .map(
            ([title, highlighted]) =>
              `<CodeGroupItem title="${title}">${highlighted}</CodeGroupItem>`,
          )
          .join("\n");

        return `<CodeGroup>${tabs}</CodeGroup>`;
      };
    },
  };
}
