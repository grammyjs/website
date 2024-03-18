import MarkdownIt from "markdown-it";
import { betterLineBreaks, currentVersions } from "./index.js";

export const markdown = (md: MarkdownIt) => {
  md.use(currentVersions).use(betterLineBreaks);
};
