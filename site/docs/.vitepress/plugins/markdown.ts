import MarkdownIt from "markdown-it";
import { betterLineBreaks, currentVersions } from ".";

export const markdown = (md: MarkdownIt) => {
  md.use(currentVersions).use(betterLineBreaks);
};
