import { type Declaration, type Symbol as DocSymbol } from "@deno/doc/types";

export type DocNode = { name: string } & Declaration;

export type DocNodeClass = Extract<DocNode, { kind: "class" }>;
export type DocNodeFunction = Extract<DocNode, { kind: "function" }>;
export type DocNodeInterface = Extract<DocNode, { kind: "interface" }>;
export type DocNodeNamespace = Extract<DocNode, { kind: "namespace" }>;
export type DocNodeTypeAlias = Extract<DocNode, { kind: "typeAlias" }>;
export type DocNodeVariable = Extract<DocNode, { kind: "variable" }>;
export type DocNodeEnum = Extract<DocNode, { kind: "enum" }>;

export function flattenSymbols(symbols: DocSymbol[]): DocNode[] {
  return symbols.flatMap((sym) =>
    sym.declarations.map((decl) => ({ name: sym.name, ...decl }))
  );
}

export type Ref = [
  nodes: DocNode[],
  path: string,
  slug: string,
  name: string,
  description: string,
  shortdescription: string,
];
