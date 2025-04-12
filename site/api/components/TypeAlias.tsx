import { DocNodeNamespace, DocNodeTypeAlias } from "@deno/doc/types";
import { TsType } from "./TsType.tsx";
import { LinkGetter } from "./types.ts";
import { H1 } from "./H1.tsx";
import { Sector } from "./Sector.tsx";
import { TypeParams } from "./TypeParams.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { P } from "./P.tsx";
import { Loc } from "./Loc.tsx";
import { ToC } from "./ToC.tsx";

export function TypeAlias(
  { getLink, children: typeAlias, namespace }: {
    getLink: LinkGetter;
    children: DocNodeTypeAlias;
    namespace?: DocNodeNamespace;
  },
) {
  const typeParams = typeAlias.typeAliasDef.typeParams;

  return (
    <>
      <H1>{typeAlias.name}</H1>
      <P doc getLink={getLink}>{typeAlias.jsDoc?.doc}</P>
      <Loc>{typeAlias}</Loc>
      <Sector title="Type Parameters" show={!!typeParams.length}>
        <TypeParams getLink={getLink}>{typeParams}</TypeParams>
      </Sector>
      <Sector title="Type" show>
        <CodeBlock>
          <TsType getLink={getLink}>{typeAlias.typeAliasDef.tsType}</TsType>
        </CodeBlock>
      </Sector>
      {namespace && (
        <ToC getLink={getLink}>{namespace.namespaceDef.elements}</ToC>
      )}
    </>
  );
}
