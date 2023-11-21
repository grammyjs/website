import { modules } from "../modules.ts";
import * as path from "std/path/mod.ts";
import { doc } from "deno_doc/mod.ts";
import { renderToString } from "preact-render-to-string";
import { Class } from "./components/Class.tsx";
import { Function } from "./components/Function.tsx";
import {
  type DocNode,
  DocNodeClass,
  DocNodeNamespace,
} from "deno_doc/types.d.ts";
import { ToC } from "./components/ToC.tsx";
import { JSX } from "preact/jsx-runtime";
import { Interface } from "./components/Interface.tsx";
import { Variable } from "./components/Variable.tsx";
import { TypeAlias } from "./components/TypeAlias.tsx";
import links from "./links.ts";

const out = Deno.args[0];
if (!out) throw new Error("no out!");

const paths: [string, string, string, string][] = Deno.args[1]
  ? [[Deno.args[1], path.join(out, "mod"), "core", "Core API"]]
  : modules.map(
    ({
      user = "grammyjs",
      repo,
      branch = "main",
      slug,
      entrypoint = "src/mod.ts",
      name,
    }) => [
      `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${entrypoint}`,
      path.join(out, slug),
      slug,
      name,
    ],
  );

console.log("Generating docs for", paths.length, "modules");

const refs: Array<[DocNode[], string, string, string]> = await Promise.all(
  paths.map(async ([id, path, slug, name]) => {
    const nodes = await doc(id);
    return [
      nodes.sort((a, b) => a.name.localeCompare(b.name)),
      path,
      slug,
      name,
    ];
  }),
);

const namespaceGetLink = (
  slug: string,
  namespace: DocNodeNamespace,
  getLink: (typeRef: string) => string | null,
): typeof getLink => {
  return (typeRef) => {
    const node_ = namespace.namespaceDef.elements.find((v) =>
      v.name == typeRef
    );
    if (node_ !== undefined) {
      return "/ref/" + slug + "/" + namespace.name + "/" +
        encodeURIComponent(typeRef);
    } else {
      return getLink(typeRef);
    }
  };
};

function createDoc(
  node: DocNode,
  path_: string,
  getLink: (repr: string) => string | null,
  slug: string,
  namespace?: DocNodeNamespace,
  classParent?: DocNodeClass,
) {
  let component: JSX.Element | null = null;
  switch (node.kind) {
    case "class":
      component = <Class getLink={getLink} parent={classParent}>{node}</Class>;
      break;
    case "variable":
      component = <Variable getLink={getLink}>{node}</Variable>;
      break;
    case "function":
      component = <Function getLink={getLink}>{node}</Function>;
      break;
    case "interface":
      component = (
        <Interface
          getLink={namespace !== undefined
            ? namespaceGetLink(slug, namespace, getLink)
            : getLink}
          namespace={namespace}
        >
          {node}
        </Interface>
      );
      break;
    case "typeAlias":
      component = (
        <TypeAlias
          getLink={namespace !== undefined
            ? namespaceGetLink(slug, namespace, getLink)
            : getLink}
          namespace={namespace}
        >
          {node}
        </TypeAlias>
      );
      break;
  }
  if (component != null) {
    const contents = `---
editLink: false
---

${renderToString(component)}`;
    const filename = path.join(path_, `${node.name}.md`);
    Deno.mkdirSync(path.dirname(filename), { recursive: true });
    Deno.writeTextFileSync(filename, contents, { append: true });
    return true;
  }
  return false;
}

console.log("Purging output folder", out);
try {
  Deno.removeSync(out, {
    recursive: true,
    // Why is this missing from Deno?
    /* allowNotExists: true */
  });
} catch {
  // ignore if missing
}

console.log("Creating files");
let count = 0;
const allNodes = refs.map(([nodes]) => nodes).flat();
for (const [nodes, path_, slug, name] of refs) {
  const getLink = (repr: string) => {
    const node = nodes.find((v) => v.name == repr);
    if (node !== undefined) {
      return "/ref/" + slug + "/" + encodeURIComponent(repr);
    } else {
      return links[repr] ?? null;
    }
  };
  for (const node of nodes) {
    if (node.kind == "namespace") {
      for (const el of node.namespaceDef.elements) {
        createDoc(
          el,
          path.join(path_, node.name),
          namespaceGetLink(slug, node, getLink),
          slug,
          undefined,
          ((el.kind == "class" && el.classDef.extends !== undefined)
            ? node.namespaceDef.elements.find((v) =>
              v.kind == "class" &&
              v.name == (el as DocNodeClass).classDef.extends
            ) ?? allNodes.find((v) =>
              v.kind == "class" &&
              v.name == (el as DocNodeClass).classDef.extends
            )
            : undefined) as DocNodeClass | undefined,
        ) && count++;
      }
    } else {
      createDoc(
        node,
        path_,
        getLink,
        slug,
        (node.kind == "typeAlias" || node.kind == "interface")
          ? nodes.filter((v): v is DocNodeNamespace => v.kind == "namespace")
            .find((v) => v.name == node.name)
          : undefined,
        ((node.kind == "class" && node.classDef.extends !== undefined)
          ? allNodes.find((v) =>
            v.kind == "class" &&
            v.name == (node as DocNodeClass).classDef.extends
          )
          : undefined) as DocNodeClass | undefined,
      ) && count++;
    }
  }
  {
    const filename = path.join(path_, "README.md");
    const content = `---
editLink: false
---

${
      renderToString(
        <ToC name={name + " Reference"} getLink={getLink}>{nodes}</ToC>,
      )
    }`;

    Deno.writeTextFileSync(filename, content);
    count++;
  }
  console.log("Wrote", path_);
}

console.log("Done writing", count, "files.");
