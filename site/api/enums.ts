import { type DocNodeEnum } from "./deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeEnum) {
  return `# \`enum\` [\`${node.name}\`](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
