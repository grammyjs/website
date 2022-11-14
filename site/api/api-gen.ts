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

const paths: Array<[string, string]> = modules.map((
  { mod, slug, entrypoint },
) => [`https://deno.land/x/${mod}/${entrypoint ?? "mod.ts"}`, join(out, slug)]);

console.log("Generating docs for", paths.length, "modules");

const refs: Array<[DocNode[], string]> = await Promise.all(
  paths.map(async ([id, path]) => [await doc(id), path]),
);

const enc = new TextEncoder();
function createDocsWith<N extends DocNode>(
  transform: (n: N) => string,
  path: string,
) {
  return (n: N) => {
    const filename = join(path, `${n.name}.md`);
    const content = transform(n);
    const escaped = escapeHtmlInMarkdown(content);
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
  console.log("Wrote", path);
}

console.log("Done.");
