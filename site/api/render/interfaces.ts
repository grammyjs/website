import { type DocNodeInterface } from "../deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeInterface) {
  return `# \`interface\` [\`${node.name}\`](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
