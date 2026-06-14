import { type DocNode } from "./doc_types.ts";

export type Ref = [
  nodes: DocNode[],
  path: string,
  slug: string,
  name: string,
  description: string,
  shortdescription: string,
];
