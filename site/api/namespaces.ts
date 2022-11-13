import { type DocNodeNamespace } from "./deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeNamespace) {
  return `# \`namespace\` [\`${node.name}\`](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
