import { type DocNodeInterface, type InterfacePropertyDef } from "../deps.ts";
import { annotate, loc } from "./utils.ts";

export function getContent(node: DocNodeInterface) {
  return `# \`interface ${node.name}\` [\[src\]](${loc(node.location)})${
    node.jsDoc?.doc ? "\n\n" + node.jsDoc.doc : ""
  }${getProperties(node.interfaceDef.properties)}
`;
}

function getProperties(props: InterfacePropertyDef[]): string {
  if (props.length === 0) return "";
  return `

## Properties

${
    props.map((p) =>
      `### \`${p.name + annotate(p.tsType)}\`\
\
${p.jsDoc?.doc ? "\n\n" + p.jsDoc.doc : ""}`
    ).join("\n\n")
  }`;
}
