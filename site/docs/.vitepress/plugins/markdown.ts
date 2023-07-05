import MarkdownIt from "markdown-it";
import { betterLineBreaks, currentVersions, betterAnchors } from ".";

export const markdown = (md: MarkdownIt) => {
  md.use(currentVersions).use(betterLineBreaks).use(betterAnchors);
};
