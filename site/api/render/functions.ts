import { type DocNodeFunction } from "../deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeFunction) {
  return `# \`function ${node.name}\` [\[src\]](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
