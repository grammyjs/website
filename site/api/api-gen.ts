// Deps
import { modules } from "../modules.ts";
import {
  dirname,
  doc,
  type DocNode,
  type DocNodeClass as DClass,
  type DocNodeEnum as DEnum,
  type DocNodeFunction as DFunction,
  type DocNodeInterface as DInterface,
  type DocNodeModuleDoc as DModuleDoc,
  type DocNodeNamespace as DNamespace,
  type DocNodeTypeAlias as DTypeAlias,
  type DocNodeVariable as DVariable,
  join,
} from "./deps.ts";
import { escapeHtmlInMarkdown } from "./escape.ts";
import { createTableOfContents } from "./render/toc.ts";
// Content templates
import { getContent as getClassContent } from "./render/classes.ts";
import { getContent as getEnumContent } from "./render/enums.ts";
import { getContent as getFunctionContent } from "./render/functions.ts";
import { getContent as getInterfaceContent } from "./render/interfaces.ts";
import { getContent as getModuleContent } from "./render/modules.ts";
import { getContent as getNamespaceContent } from "./render/namespaces.ts";
import { getContent as getTypeAliasContent } from "./render/type-aliases.ts";
import { getContent as getVariableContent } from "./render/variables.ts";

const out = Deno.args[0];
if (!out) throw new Error("no out!");

const paths: Array<[string, string]> = Deno.args[1]
  ? [[Deno.args[1], join(out, "mod")]]
  : modules.map((
    {
      user = "grammyjs",
      repo,
      branch = "main",
      slug,
      entrypoint = "src/mod.ts",
    },
  ) => [
    `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${entrypoint}`,
    join(out, slug),
  ]);

console.log("Generating docs for", paths.length, "modules");

const refs: Array<[DocNode[], string]> = await Promise.all(
  paths.map(async ([id, path]) => [await doc(id), path]),
);

const enc = new TextEncoder();
function createDocsWith<N extends { name: string }>(
  transform: (n: N) => string,
  path: string,
) {
  return (n: N) => {
    const filename = join(path, `${n.name}.md`);
    const content = transform(n);
    const betterLinks = content.replaceAll("https://grammy.dev", "");
    const escaped = escapeHtmlInMarkdown(betterLinks);
    const data = enc.encode(escaped);
    Deno.mkdirSync(dirname(filename), { recursive: true });
    Deno.writeFileSync(filename, data, { append: true });
  };
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
for (const [ref, path] of refs) {
  const modules = ref.filter((n): n is DModuleDoc => n.kind === "moduleDoc");
  const functions = ref.filter((n): n is DFunction => n.kind === "function");
  const variables = ref.filter((n): n is DVariable => n.kind === "variable");
  const enums = ref.filter((n): n is DEnum => n.kind === "enum");
  const classes = ref.filter((n): n is DClass => n.kind === "class");
  const typeAliasess = ref.filter((n): n is DTypeAlias =>
    n.kind === "typeAlias"
  );
  const namespaces = ref.filter((n): n is DNamespace => n.kind === "namespace");
  const interfaces = ref.filter((n): n is DInterface => n.kind === "interface");

  modules.forEach(createDocsWith(getModuleContent, path));
  functions.forEach(createDocsWith(getFunctionContent, path));
  variables.forEach(createDocsWith(getVariableContent, path));
  enums.forEach(createDocsWith(getEnumContent, path));
  classes.forEach(createDocsWith(getClassContent, path));
  typeAliasess.forEach(createDocsWith(getTypeAliasContent, path));
  namespaces.forEach(createDocsWith(getNamespaceContent, path));
  interfaces.forEach(createDocsWith(getInterfaceContent, path));
  createDocsWith(createTableOfContents, path)({
    name: "README",
    ref: [
      ...modules,
      ...functions,
      ...variables,
      ...enums,
      ...classes,
      ...typeAliasess,
      ...namespaces,
      ...interfaces,
    ],
  });
  console.log("Wrote", path);
}

console.log("Done.");
