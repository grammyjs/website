import { modules } from "../modules.ts";
import * as path from "std/path/mod.ts";
import { doc } from "deno_doc/mod.ts";
import { renderToString } from "preact-render-to-string";
import { Class } from "./components/Class.tsx";
import { Function } from "./components/Function.tsx";
import { type DocNode } from "deno_doc/types.d.ts";
import { ToC } from "./components/ToC.tsx";
import { JSX } from "preact/jsx-runtime";
import { Interface } from "./components/Interface.tsx";
import { Variable } from "./components/Variable.tsx";
import { TypeAlias } from "./components/TypeAlias.tsx";

/// deno-lint-ignore no-explicit-any require-await
// async function doc(...a: any): Promise<any[]> {
//   return JSON.parse(Deno.readTextFileSync("doc.json"));
// }

const out = Deno.args[0];
if (!out) throw new Error("no out!");

const paths: [string, string, string][] = Deno.args[1]
  ? [[Deno.args[1], path.join(out, "mod"), "core"]]
  : modules.map(
    ({
      user = "grammyjs",
      repo,
      branch = "main",
      slug,
      entrypoint = "src/mod.ts",
    }) => [
      //   "file:///home/roj/Projects/grammY/src/mod.ts",
      `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${entrypoint}`,
      path.join(out, slug),
      slug,
    ],
  );

console.log("Generating docs for", paths.length, "modules");

const refs: Array<[DocNode[], string, string]> = await Promise.all(
  paths.map(async ([id, path, slug]) => {
    let nodes = await doc(id);
    const names = new Set<string>();
    nodes = nodes.filter((v) => {
      try {
        return !names.has(v.name);
      } finally {
        names.add(v.name);
      }
    });
    return [nodes.sort((a, b) => a.name.localeCompare(b.name)), path, slug];
  }),
);

function createDoc(
  node: DocNode,
  path_: string,
  getLink: (repr: string) => string | null,
) {
  let component: JSX.Element | null = null;
  switch (node.kind) {
    case "class":
      component = <Class getLink={getLink}>{node}</Class>;
      break;
    case "variable":
      component = <Variable getLink={getLink}>{node}</Variable>;
      break;
    case "function":
      component = <Function getLink={getLink}>{node}</Function>;
      break;
    case "interface":
      component = <Interface getLink={getLink}>{node}</Interface>;
      break;
    case "typeAlias":
      component = <TypeAlias getLink={getLink}>{node}</TypeAlias>;
  }
  if (component != null) {
    const contents = `---
editLink: false
---

${renderToString(component)}`;
    const filename = path.join(path_, `${node.name}.md`);
    Deno.mkdirSync(path.dirname(filename), { recursive: true });
    Deno.writeTextFileSync(filename, contents, { append: true });
  }
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
for (const [nodes, path_, slug] of refs) {
  const getLink = (repr: string) => {
    const node = nodes.find((v) => v.name == repr);
    if (node !== undefined) {
      return "/ref/" + slug + "/" + encodeURIComponent(repr);
    } else {
      return null;
    }
  };
  for (const node of nodes) {
    createDoc(node, path_, getLink);
  }
  {
    const filename = path.join(path_, "README.md");
    console.log(filename);
    const content = `---
editLink: false
---

${renderToString(<ToC getLink={getLink}>{nodes}</ToC>)}`;

    Deno.writeTextFileSync(filename, content);
  }
  console.log("Wrote", path_);
}

console.log("Done.");
