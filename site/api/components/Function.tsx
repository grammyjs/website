import { DocNodeFunction } from "deno_doc/types.d.ts";
import { LinkGetter } from "./types.ts";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";
import { Sector } from "./Sector.tsx";
import { TypeParams } from "./TypeParams.tsx";
import { Parameters } from "./Function/Parameters.tsx";
import { newGetLink } from "./util.ts";
import { ReturnType } from "./Function/ReturnType.tsx";

export function Function(
  { children: func, getLink: oldGetLink }: {
    children: DocNodeFunction;
    getLink: LinkGetter;
  },
) {
  const params = func.functionDef.params;
  const typeParams = func.functionDef.typeParams;
  const getLink = newGetLink(oldGetLink, typeParams);

  return (
    <>
      <H1>{func.name}</H1>
      <P doc>{func.jsDoc?.doc}</P>
      <Sector title="Type Parameters" show={!!typeParams.length}>
        <TypeParams getLink={getLink}>{typeParams}</TypeParams>
      </Sector>
      <Sector title="Parameters" show={!!params.length}>
        <Parameters getLink={getLink} doc={func.jsDoc}>{params}</Parameters>
      </Sector>
      <Sector title="Return Type" show={!!func.functionDef.returnType}>
        <ReturnType getLink={getLink} doc={func.jsDoc}>
          {func.functionDef.returnType!}
        </ReturnType>
      </Sector>
    </>
  );
}
