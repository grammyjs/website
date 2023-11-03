import { TypeAliasDef } from "deno_doc/types.d.ts";
import { TsType } from "./TsType.tsx";
import { LinkGetter } from "./TsType.tsx";

export function TypeAlias(
  { getLink, children: typeAlias }: {
    getLink: LinkGetter;
    children: TypeAliasDef;
  },
) {
  return (
    <div class="font-mono">
      <TsType getLink={getLink}>{typeAlias.tsType}</TsType>
    </div>
  );
}
