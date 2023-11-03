import { DocNodeClass, DocNodeFunction } from "deno_doc/types.d.ts";
import { Method } from "./Method.tsx";
import { Properties } from "./Properties.tsx";
import { LinkGetter } from "./types.ts";
// import { Constructors } from "./TsType.tsx";

export function Function(
  { children: func, getLink }: {
    children: DocNodeFunction;
    getLink: LinkGetter;
  },
) {
  return (
    <>
      {`# ${func.name}\n`}
      {func.jsDoc?.doc}
      {"\n\n"}
      {"## Type Parameters\n"}
      {"Todo"}
      {"\n"}
      {"## Parameters\n"}
      {"Todo"}
      {"\n"}
      {"## Return Type\n"}
      {"Todo"}
      {"\n"}
    </>
  );
}
