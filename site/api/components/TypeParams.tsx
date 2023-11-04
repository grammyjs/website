import { TsTypeParamDef } from "deno_doc/types.d.ts";
import { LinkGetter } from "./types.ts";
import { H3 } from "./H3.tsx";
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
          <H3>{v.name}</H3>
          <CodeBlock>
            <TypeParam_ getLink={getLink}>{v}</TypeParam_>
          </CodeBlock>
        </>
      ))}
    </>
  );
}
