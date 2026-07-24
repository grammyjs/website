import type MarkdownIt from "$types/markdown-it";
import { betterLineBreaks, } from "./index.ts";

export const markdown = (md: MarkdownIt) => {
  md.use(betterLineBreaks);
};
