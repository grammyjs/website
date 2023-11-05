import { DocNodeVariable } from "deno_doc/types.d.ts";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";
import { LinkGetter } from "./types.ts";
import { Sector } from "./Sector.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { TsType } from "./TsType.tsx";
import { Loc } from "./Loc.tsx";

export function Variable(
  { children: varr, getLink }: {
    children: DocNodeVariable;
    getLink: LinkGetter;
  },
) {
  return (
    <>
      <H1>{varr.name}</H1>
      <P doc>{varr.jsDoc?.doc}</P>
      <Loc>{varr}</Loc>
      <Sector title="Type" show={!!varr.variableDef.tsType}>
        <CodeBlock>
          <TsType getLink={getLink}>{varr.variableDef.tsType!}</TsType>
        </CodeBlock>
      </Sector>
    </>
  );
}
