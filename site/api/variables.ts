import { type DocNodeVariable } from "./deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeVariable) {
  return `# Variable [\`${node.name}\`](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
