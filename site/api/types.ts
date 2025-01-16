import { type DocNode } from "@deno/doc/types";

export type Ref = [
  nodes: DocNode[],
  path: string,
  slug: string,
  name: string,
  description: string,
  shortdescription: string,
];
