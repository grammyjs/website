import { type DocNodeClass } from "./deps.ts";
import { loc } from "./utils.ts";

export function getContent(node: DocNodeClass) {
  const c = node.classDef;
  return `# \`${c.isAbstract ? "abstract " : ""}class\` \`${node.name}\`${
    c.extends ? ` \`extends ${c.extends}\`` : ""
  }${
    c.implements.length > 0
      ? ` \`implements ${c.implements.map((i) => i.repr).join(", ")}\``
      : ""
  } [\[src\]](${loc(node.location)})

${node.jsDoc?.doc ?? ""}
`;
}
