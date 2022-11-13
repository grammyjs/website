import { type DocNodeModuleDoc } from "./deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeModuleDoc) {
  return `# Module [\`${node.name}\`](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
