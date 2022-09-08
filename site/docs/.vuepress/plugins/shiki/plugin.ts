import type MarkdownIt from "markdown-it";
import { setupForFile, transformAttributesToHTML } from "remark-shiki-twoslash";
import type { UserConfigSettings } from "shiki-twoslash";
import { idsToUrls, urlsToIds } from "./convert-imports";

function setup(settings: UserConfigSettings) {
  return setupForFile(settings).then(({ highlighters }) => highlighters);
}

function createCodeGroup(
  { typescript, deno, javascript }: {
    typescript: string;
    deno: string;
    javascript: string;
  },
) {
  return `
  <pre class="invisible"></pre>
  <CodeGroup>
    <CodeGroupItem title="TypeScript" active>
      ${typescript}
    </CodeGroupItem>
    <CodeGroupItem title="JavaScript">
      ${javascript}
    </CodeGroupItem>
    <CodeGroupItem title="Deno">
      ${deno}
    </CodeGroupItem>
  </CodeGroup>`.trim();
}

class ShikiTwoslash {
  constructor(
    private readonly highlighters: Awaited<
      ReturnType<typeof setupForFile>
    >["highlighters"],
    private readonly settings: UserConfigSettings,
  ) {}

  highlight(code: string, lang: string, attrs: string) {
    code = code.replace(/\r?\n$/, ""); // strip trailing newline fed during code block parsing
    const enableTwoslash = attrs.includes("twoslash");
    const enableExpansion = attrs.split(" ").includes("expand");

    // if twoslash nor expansion are enabled, just highlight as normal
    if (!enableTwoslash && !enableExpansion) {
      return this.highlightOnly(code, lang, attrs);
    }

    if (!enableExpansion && enableTwoslash) {
      // if twoslash is enabled, but expansion is not, replace imports, then highlight
      return this.getTwoslash(code, lang, attrs);
    }

    if (!enableTwoslash && enableExpansion) {
      // if twoslash is not enabled, but expansion is, use twoslash only for compilation to javascript
      return this.getExpanded(code, lang, attrs);
    }

    // if we land here, it means both twoslash and expansion are enabled
    return this.getExpandedTwoslash(code, lang, attrs);
  }

  private getTwoslash(code: string, lang: string, attrs: string) {
    return this.replaceAndHighlight(code, lang, attrs)[0];
  }

  private getExpanded(code: string, lang: string, attrs: string) {
    const [typescriptResult, replaceMap] = this.replaceAndHighlight(
      code,
      lang,
      attrs,
    );

    // generate deno code by replacing IDs with URLs in the ts result
    const denoResult = idsToUrls(typescriptResult, replaceMap);

    const javascriptResult = this.highlightToJs(
      urlsToIds(code)[0],
      lang,
      attrs,
    );

    // Return a codegroup with all three snippet flavors
    return createCodeGroup({
      typescript: typescriptResult,
      javascript: javascriptResult,
      deno: denoResult,
    });
  }

  private getExpandedTwoslash(code: string, lang: string, attrs: string) {
    const [codeWithIds, replaceMap] = urlsToIds(code);

    // we highlight the typescript code
    const typescriptResult = this.highlightOnly(
      codeWithIds,
      lang,
      attrs,
    );

    // and reuse the result to map ids back to urls
    const denoResult = idsToUrls(typescriptResult, replaceMap);

    // finally, we can highlight the code with ids once more, but now with `showEmit` to generate JavaScript
    const javascriptResult = this.highlightToJs(
      codeWithIds,
      lang,
      attrs,
    );

    return createCodeGroup({
      typescript: typescriptResult,
      javascript: javascriptResult,
      deno: denoResult,
    });
  }

  highlightOnly(code: string, lang: string, attrs: string) {
    try {
      return transformAttributesToHTML(
        code,
        [lang, attrs].join(" "),
        this.highlighters,
        this.settings,
      );
    } catch (err) {
      return `${err}`;
    }
  }

  replaceAndHighlight(code: string, lang: string, attrs: string) {
    const [replacedCode, replacedMap] = urlsToIds(code);

    const highlightedCode = this.highlightOnly(
      replacedCode,
      lang,
      attrs,
    );

    return [idsToUrls(highlightedCode, replacedMap), replacedMap] as const;
  }

  highlightToJs(code: string, lang: string, attrs: string) {
    const annotatedCode = code.replace(/^\s*$/gm, "//EMPTYLINE");

    return this.highlightOnly(
      ["// @target: ESNext", "// @showEmit", annotatedCode].join("\n"),
      lang,
      `twoslash ${attrs}`,
    ).replace(/\/\/EMPTYLINE/ig, "");
  }
}

let shikiTwoslash: ShikiTwoslash;

export default (settings: UserConfigSettings) => ({
  name: "vuepress-plugin-shiki-twoslash",
  extendsMarkdown: async (md: MarkdownIt) => {
    shikiTwoslash = shikiTwoslash ||
      new ShikiTwoslash(await setup(settings), settings);

    md.options.highlight = (code, lang, attrs) =>
      shikiTwoslash.highlight(code, lang, attrs);
  },
});
