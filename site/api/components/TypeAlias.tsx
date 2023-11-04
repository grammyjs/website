import { DocNodeTypeAlias } from "deno_doc/types.d.ts";
import { TsType } from "./TsType.tsx";
import { LinkGetter } from "./types.ts";
import { H1 } from "./H1.tsx";
import { Sector } from "./Sector.tsx";
import { TypeParams } from "./TypeParams.tsx";
import { P } from "./P.tsx";
import { CodeBlock } from "./CodeBlock.tsx";

export function TypeAlias(
  { getLink, children: typeAlias }: {
    getLink: LinkGetter;
    children: DocNodeTypeAlias;
  },
) {
  const typeParams = typeAlias.typeAliasDef.typeParams;

  return (
    <>
      <H1>{typeAlias.name}</H1>
      <P>{typeAlias.jsDoc?.doc}</P>
      <Sector title="Type Parameters" show={!!typeParams.length}>
        <TypeParams getLink={getLink}>{typeParams}</TypeParams>
      </Sector>
      <Sector title="Type" show={true}>
        <CodeBlock>
          <TsType getLink={getLink}>{typeAlias.typeAliasDef.tsType}</TsType>
        </CodeBlock>
      </Sector>
    </>
  );
}
