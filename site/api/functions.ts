import { type DocNodeFunction } from "./deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeFunction) {
  return `# \`function\` [\`${node.name}\`](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
