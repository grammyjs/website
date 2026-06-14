import {
  type ClassDef,
  type DeclarationKind,
  type DocNodeKind,
  type EnumDef,
  type FunctionDef,
  type InterfaceDef,
  type JsDoc,
  type Location,
  type Symbol as DocSymbol,
  type TypeAliasDef,
  type VariableDef,
} from "@deno/doc/types";

export type { DocNodeKind } from "@deno/doc/types";

interface DocNodeBase {
  name: string;
  jsDoc?: JsDoc;
  location: Location;
  declarationKind: DeclarationKind;
}

export interface DocNodeClass extends DocNodeBase {
  kind: "class";
  classDef: ClassDef;
}

export interface DocNodeFunction extends DocNodeBase {
  kind: "function";
  functionDef: FunctionDef;
}

export interface DocNodeInterface extends DocNodeBase {
  kind: "interface";
  interfaceDef: InterfaceDef;
}

export interface DocNodeNamespace extends DocNodeBase {
  kind: "namespace";
  namespaceDef: { elements: DocNode[] };
}

export interface DocNodeTypeAlias extends DocNodeBase {
  kind: "typeAlias";
  typeAliasDef: TypeAliasDef;
}

export interface DocNodeVariable extends DocNodeBase {
  kind: "variable";
  variableDef: VariableDef;
}

export interface DocNodeEnum extends DocNodeBase {
  kind: "enum";
  enumDef: EnumDef;
}

export interface DocNodeOther extends DocNodeBase {
  kind: Exclude<
    DocNodeKind,
    "class" | "function" | "interface" | "namespace" | "typeAlias" | "variable" | "enum"
  >;
}

export type DocNode =
  | DocNodeClass
  | DocNodeFunction
  | DocNodeInterface
  | DocNodeNamespace
  | DocNodeTypeAlias
  | DocNodeVariable
  | DocNodeEnum
  | DocNodeOther;

export function symbolsToDocNodes(symbols: DocSymbol[]): DocNode[] {
  return symbols.flatMap((sym) =>
    sym.declarations.map((decl): DocNode => {
      const base: DocNodeBase = {
        name: sym.name,
        jsDoc: decl.jsDoc,
        location: decl.location,
        declarationKind: decl.declarationKind,
      };
      switch (decl.kind) {
        case "class":
          return { ...base, kind: "class", classDef: decl.def };
        case "function":
          return { ...base, kind: "function", functionDef: decl.def };
        case "namespace":
          return {
            ...base,
            kind: "namespace",
            namespaceDef: { elements: symbolsToDocNodes(decl.def.elements) },
          };
        case "interface":
          return { ...base, kind: "interface", interfaceDef: decl.def };
        case "typeAlias":
          return { ...base, kind: "typeAlias", typeAliasDef: decl.def };
        case "variable":
          return { ...base, kind: "variable", variableDef: decl.def };
        case "enum":
          return { ...base, kind: "enum", enumDef: decl.enumDef };
        default:
          return { ...base, kind: decl.kind } as DocNodeOther;
      }
    })
  );
}
