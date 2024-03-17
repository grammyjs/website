import { type DocNode } from "deno_doc/types.d.ts";

export type Ref = [
  nodes: DocNode[],
  path: string,
  slug: string,
  name: string,
  description: string,
  shortdescription: string,
];
