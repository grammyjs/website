import MarkdownIt from "markdown-it";
import { betterLineBreaks, currentVersions, htmlInCodeBlocks } from ".";

export const markdown = (md: MarkdownIt) => {
  md.use(currentVersions).use(betterLineBreaks).use(htmlInCodeBlocks);
};
