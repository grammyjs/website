import { TsTypeParamDef } from "deno_doc/types.d.ts";
import { LinkGetter } from "./types.ts";
import { H4 } from "./H4.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { TypeParam_ } from "./TsType.tsx";

export function TypeParams(
  { children: typeParams, getLink }: {
    children: TsTypeParamDef[];
    getLink: LinkGetter;
  },
) {
  return (
    <>
      {typeParams.map((v) => (
        <>
          <H4>{v.name}</H4>
          <CodeBlock>
            <TypeParam_ getLink={getLink}>{v}</TypeParam_>
          </CodeBlock>
        </>
      ))}
    </>
  );
}
