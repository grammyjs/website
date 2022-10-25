import { type DocNodeClass } from "./deps.ts";

export function getClassContent(node: DocNodeClass) {
  return `# \`class\` ${node.name}

${node.jsDoc?.doc ?? ""}
`;
}
