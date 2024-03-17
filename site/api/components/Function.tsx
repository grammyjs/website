import { DocNodeFunction } from "deno_doc/types.d.ts";
import { LinkGetter } from "./types.ts";
import { H1 } from "./H1.tsx";
import { H2 } from "./H2.tsx";
import { P } from "./P.tsx";
import { Sector } from "./Sector.tsx";
import { TypeParams } from "./TypeParams.tsx";
import { Parameters } from "./Function/Parameters.tsx";
import { newGetLink } from "./util.ts";
import { ReturnType } from "./Function/ReturnType.tsx";
import { Loc } from "./Loc.tsx";

export function Function(
  { children: func, getLink: oldGetLink, overloadCount }: {
    children: DocNodeFunction;
    getLink: LinkGetter;
    overloadCount?: number;
  },
) {
  const params = func.functionDef.params;
  const typeParams = func.functionDef.typeParams;
  const getLink = newGetLink(oldGetLink, typeParams);

  return (
    <>
      {(!overloadCount || overloadCount === 1) && <H1>{func.name}</H1>}
      {overloadCount && <H2>Overload {overloadCount}</H2>}
      <P doc>{func.jsDoc?.doc}</P>
      <Loc>{func}</Loc>
      <Sector
        title="Type Parameters"
        show={!!typeParams.length}
        h3={!!overloadCount}
      >
        <TypeParams getLink={getLink}>{typeParams}</TypeParams>
      </Sector>
      <Sector title="Parameters" show={!!params.length} h3={!!overloadCount}>
        <Parameters getLink={getLink} doc={func.jsDoc}>{params}</Parameters>
      </Sector>
      <Sector
        title="Return Type"
        show={!!func.functionDef.returnType}
        h3={!!overloadCount}
      >
        <ReturnType getLink={getLink} doc={func.jsDoc}>
          {func.functionDef.returnType!}
        </ReturnType>
      </Sector>
    </>
  );
}
