import type MarkdownIt from "markdown-it";
import { writeFileSync } from "node:fs";

export const htmlInCodeBlocks = (md: MarkdownIt) => {
  const oldHtmlBlock = md.renderer.rules.html_block ?? (() => "");

  md.renderer.rules.html_block = (tokens, idx, options, env, self) => {
    return oldHtmlBlock(
      tokens,
      idx,
      options,
      env,
      self,
    );
  };
};
