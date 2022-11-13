import { type DocNodeTypeAlias } from "./deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeTypeAlias) {
  return `# \`type\` [\`${node.name}\`](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
