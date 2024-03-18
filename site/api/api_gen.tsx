import { modules } from "../modules.ts";
import * as fs from "std/fs/mod.ts";
import * as path from "std/path/mod.ts";
import { doc } from "deno_doc/mod.ts";
import { renderToString } from "preact-render-to-string";
import { Class } from "./components/Class.tsx";
import { Function } from "./components/Function.tsx";
import {
  type DocNode,
  DocNodeClass,
  DocNodeFunction,
  DocNodeNamespace,
} from "deno_doc/types.d.ts";
import { ToC } from "./components/ToC.tsx";
import { JSX } from "preact/jsx-runtime";
import { Interface } from "./components/Interface.tsx";
import { Variable } from "./components/Variable.tsx";
import { TypeAlias } from "./components/TypeAlias.tsx";
import { Overview } from "./components/Overview.tsx";
import links from "./external_links.ts";
import { Ref } from "./types.ts";

const out = Deno.args[0];
if (!out) throw new Error("no out!");

const enc = new TextEncoder();

const paths: [string, string, string, string, string, string][] = modules.map(
  ({
    user = "grammyjs",
    repo,
    branch = "main",
    slug,
    entrypoint = "src/mod.ts",
    name,
    description,
    shortdescription,
  }) => [
    `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${entrypoint}`,
    path.join(out, slug),
    slug,
    name,
    description,
    shortdescription,
  ],
);

Deno.stdout.writeSync(
  enc.encode(`Generating docs for ${paths.length} modules`),
);
const dot = enc.encode(".");
const refs: Array<Ref> = await Promise
  .all(
    paths.map(
      async ([id, path, slug, name, description, shortdescription]) => {
        const nodes = await doc(id);
        Deno.stdout.writeSync(dot);
        return [
          nodes.sort((a, b) => a.name.localeCompare(b.name)),
          path,
          slug,
          name,
          description,
          shortdescription,
        ];
      },
    ),
  );
Deno.stdout.writeSync(enc.encode("done\n"));

function namespaceGetLink(
  slug: string,
  namespace: DocNodeNamespace,
  getLink: (typeRef: string) => string | null,
): typeof getLink {
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
}

function createDoc(
  node: DocNode,
  path_: string,
  getLink: (repr: string) => string | null,
  slug: string,
  namespace?: DocNodeNamespace,
  classParent?: DocNodeClass,
  overloadCount?: number,
  overloads?: DocNodeFunction[],
) {
  const nav = `<div><sup><a href="/ref/">ref</a> / <a href="/ref/${slug}/">${
    slug.replaceAll("/", " / ")
  }</a> / ${node.name}</sup></div>`;
  let component: JSX.Element | null = null;
  switch (node.kind) {
    case "class":
      component = <Class getLink={getLink} parent={classParent}>{node}</Class>;
      break;
    case "variable":
      component = <Variable getLink={getLink}>{node}</Variable>;
      break;
    case "function":
      component = (
        <Function
          getLink={getLink}
          overloadCount={overloadCount}
          overloads={overloads}
        >
          {node}
        </Function>
      );
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
    const filename = path.join(path_, `${node.name}.md`);
    let contents = renderToString(component);

    if (!overloadCount || overloadCount == 1) {
      // inject nav
      {
        let lines = contents.split("\n");
        const titleIdx = lines.findIndex((v) => v.startsWith("# "));
        lines = lines.slice(0, titleIdx + 1).concat([nav]).concat(
          lines.slice(titleIdx + 1),
        );
        contents = lines.join("\n");
      }
    }

    fs.ensureDirSync(path.dirname(filename));
    if (!fs.exists(filename, { isFile: true })) {
      contents = "---\neditLink: false\ntranslation: false\n---\n\n" + contents;
    }
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
} catch (err) {
  // ignore if missing
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
}

console.log("Creating files");
const allNodes = refs.map(([nodes]) => nodes).flat();
// replace all external links to grammy.dev by internal links
for (const v of allNodes) {
  const doc = v.jsDoc;
  if (doc !== undefined) {
    if (doc.doc !== undefined) {
      doc.doc = doc.doc
        .replaceAll("https://grammy.dev/", "/");
    }
  }
}
const coreNodes = refs.find(([, , slug]) => slug === "core")?.[0];
if (coreNodes === undefined) throw new Error("No core ref found!"); // never happens
const typesNodes = refs.find(([, , slug]) => slug === "types")?.[0];
if (typesNodes === undefined) throw new Error("No types ref found!"); // never happens

let count = 0;

for (const [nodes, path_, slug, name, description] of refs) {
  /** Defines how to obtain a link to a symbol */
  const getLink = (repr: string): string | null => {
    // Try getting the link from the current plugin page.
    const node = nodes.find((v) => v.name == repr);
    if (node !== undefined) {
      return "/ref/" + slug + "/" + encodeURIComponent(repr);
    }
    // Try getting the link from the core ref.
    const coreNode = coreNodes.find((v) => v.name === repr);
    if (coreNode !== undefined) {
      return "/ref/core/" + encodeURIComponent(repr);
    }
    // Try getting the link from the types ref.
    const typesNode = typesNodes.find((v) => v.name === repr);
    if (typesNode !== undefined) {
      return "/ref/types/" + encodeURIComponent(repr);
    }
    // Try getting the link externally.
    if (repr in links) {
      return links[repr]!;
    }
    // Do not include a link.
    return null;
  };
  const getOverloadCount = (node: DocNode, nodes: DocNode[]) => {
    let overloadCount = node.kind == "function"
      ? nodes.filter((v) => v.kind == "function" && v.name == node.name).length
      : undefined;
    if (overloadCount == 1) {
      overloadCount = undefined;
    } else if (overloadCount && overloadCount > 1) {
      overloadCount = nodes.filter((v) =>
        v.kind == "function" && v.name == node.name
      ).findIndex((v) => v == node) + 1;
    }
    return overloadCount;
  };
  const getOverloads = (node: DocNode, nodes: DocNode[]) => {
    if (node.kind != "function") {
      return;
    }
    return nodes.filter((v) => v.kind == "function" && v.name == node.name)
      .slice(
        1,
      ) as DocNodeFunction[];
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
          getOverloadCount(node, nodes),
          getOverloads(node, nodes),
        ) && ++count;
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
        getOverloadCount(node, nodes),
        getOverloads(node, nodes),
      ) && ++count;
    }
  }
  {
    const filename = path.join(path_, "README.md");
    let content = renderToString(
      <ToC
        name={name + " Reference"}
        description={description}
        getLink={getLink}
      >
        {nodes}
      </ToC>,
    );

    // inject nav
    {
      const nav = `<div><sup><a href="/ref/">ref</a> / ${
        slug.replaceAll("/", " / ")
      }</sup></div>`;
      let lines = content.split("\n");
      const titleIdx = lines.findIndex((v) => v.startsWith("# "));
      lines = lines.slice(0, titleIdx + 1).concat([nav]).concat(
        lines.slice(titleIdx + 1),
      );
      content = lines.join("\n");
    }
    content = `---
editLink: false
translation: false
---

${content}`;

    Deno.writeTextFileSync(filename, content);
    ++count;
  }
  console.log("Wrote", path_);
}

const overviewPath = path.join(out, "README.md");
Deno.writeTextFileSync(
  overviewPath,
  `---
editLink: false
translation: false
---

${renderToString(<Overview refs={refs} />)}
`,
);
++count;
console.log("Wrote overview to", overviewPath);

console.log("Done writing", count, "files.");
