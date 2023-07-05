import MarkdownIt from "markdown-it";
import { betterAnchors, betterLineBreaks, currentVersions } from ".";

export const markdown = (md: MarkdownIt) => {
  md.use(currentVersions).use(betterLineBreaks).use(betterAnchors);
};
