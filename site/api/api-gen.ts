import { getClassContent } from "./classes.ts";
import {
  dirname,
  doc,
  type DocNode,
  type DocNodeClass as DClass,
  type DocNodeEnum as DEnum,
  type DocNodeFunction as DFunction,
  type DocNodeImport as DImport,
  type DocNodeInterface as DInterface,
  type DocNodeModuleDoc as DModuleDoc,
  type DocNodeNamespace as DNamespace,
  type DocNodeTypeAlias as DTypeAlias,
  type DocNodeVariable as DVariable,
  join,
  resolve,
} from "./deps.ts";

const config = Deno.args[0];
if (!config) throw new Error("no config!");

const out = Deno.args[1];
if (!out) throw new Error("no out!");

console.log("Loading modules");

const { default: list } = await import(resolve(config), {
  assert: { type: "json" },
});

const paths: Array<[string, string]> = Object.entries(list.modules)
  .filter((mp): mp is [string, string] => typeof mp[1] === "string" && !!mp[1])
  .map(([id, path]) => [`https://deno.land/x/${id}/mod.ts`, join(out, path)]);

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
    const data = enc.encode(content);
    Deno.mkdirSync(dirname(filename), { recursive: true });
    Deno.writeFileSync(filename, data);
  };
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
  const imports = ref.filter((n): n is DImport => n.kind === "import");

  // modules.forEach(createDocsWith(getModuleContent, path));
  // functions.forEach(createDocsWith(getFunctionContent, path));
  // variables.forEach(createDocsWith(getVariableContent, path));
  // enums.forEach(createDocsWith(getEnumContent, path));
  classes.forEach(createDocsWith(getClassContent, path));
  // typeAliasess.forEach(createDocsWith(getTypeAliasContent, path));
  // namespaces.forEach(createDocsWith(getNamespaceContent, path));
  // interfaces.forEach(createDocsWith(getInterfaceContent, path));
  // imports.forEach(createDocsWith(getImportContent, path));
  console.log("Wrote", path);
}
