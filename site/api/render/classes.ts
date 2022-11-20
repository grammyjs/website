import { ClassMethodDef } from "https://deno.land/x/deno_doc@0.47.0/lib/types.d.ts";
import {
  type ClassConstructorDef,
  type ClassConstructorParamDef,
  type ClassPropertyDef,
  type DocNodeClass,
} from "../deps.ts";
import { annotate, loc } from "./utils.ts";

export function getContent(node: DocNodeClass) {
  const c = node.classDef;
  return `# \`${c.isAbstract ? "abstract " : ""}class ${node.name}${
    c.extends ? ` extends ${c.extends}` : ""
  }${
    c.implements.length > 0
      ? ` implements ${c.implements.map((i) => i.repr).join(", ")}`
      : ""
  }\` [\[src\]](${loc(node.location)})${
    node.jsDoc?.doc ? "\n\n" + node.jsDoc.doc : ""
  }${getConstructors(node.name, c.constructors)}${getProperties(c.properties)}${
    getMethods(c.methods)
  }
`;
}

function getConstructors(className: string, consts: ClassConstructorDef[]) {
  if (consts.length === 0) return "";
  return `

## Constructors

${
    consts.map((c) =>
      `### \`${c.accessibility ? c.accessibility + " " : ""}new ${className}(${
        c.params.map(getConstructorParam).join(", ")
      })\` [\[src\]](${loc(c.location)})\
\
${c.jsDoc ? "\n\n" + c.jsDoc.doc : ""}`
    ).join("\n\n")
  }`;
}
function getConstructorParam(param: ClassConstructorParamDef): string {
  switch (param.kind) {
    case "identifier":
      return param.name + annotate(param.tsType);
    case "rest":
      return "..." + getConstructorParam(param.arg) + annotate(param.tsType);
  }
  // TODO: add remaining cases
  return JSON.stringify(param);
}

function getProperties(props: ClassPropertyDef[]): string {
  if (props.length === 0) return "";
  return `

### Properties

${
    props.map((p) =>
      `#### \`${p.name + annotate(p.tsType)}\`\
\
${p.jsDoc?.doc ? "\n\n" + p.jsDoc.doc : ""}`
    ).join("\n\n")
  }`;
}

function getMethods(props: ClassMethodDef[]): string {
  if (props.length === 0) return "";
  return `

### Methods

${
    props.map((p) =>
      `#### \`${p.name}\`\
\
${p.jsDoc?.doc ? "\n\n" + p.jsDoc.doc : ""}`
    ).join("\n\n")
  }`;
}
