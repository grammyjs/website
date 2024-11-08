import type MarkdownIt from "$types/markdown-it";
import { betterLineBreaks, currentVersions } from "./index.ts";

export const markdown = (md: MarkdownIt) => {
  md.use(currentVersions).use(betterLineBreaks);
};
