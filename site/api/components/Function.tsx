import { DocNodeFunction } from "@deno/doc/types";
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
import { CodeBlock } from "./CodeBlock.tsx";
import { Def } from "./Class/Method.tsx";
import { StyleTypeRef } from "./styles.tsx";

export function Function(
  { children: func, getLink: oldGetLink, overloadCount, overloads }: {
    children: DocNodeFunction;
    getLink: LinkGetter;
    overloads?: DocNodeFunction[];
    overloadCount?: number;
  },
) {
  const params = func.functionDef.params;
  const typeParams = func.functionDef.typeParams;
  const getLink = newGetLink(oldGetLink, typeParams);

  return (
    <>
      {(!overloadCount || overloadCount == 1) && <H1>{func.name}</H1>}
      {overloadCount && <P doc getLink={getLink}>{func.jsDoc?.doc}</P>}
      {!!overloads?.length && (
        <CodeBlock>
          //{" "}
          <a
            href="#overload-1"
            class="typeRef"
            style={{ textDecoration: "underline" }}
          >
            <StyleTypeRef>Overload 1</StyleTypeRef>
          </a>
          {"\n"}
          <Def method={func} getLink={getLink} />
          {"\n"}
          {overloads
            .slice(0, -1) // the last one is never exported
            .map((v, i) => {
              const n = i + 2;
              return (
                <>
                  //{" "}
                  <a
                    href={`#overload-${n}`}
                    class="typeRef"
                    style={{ textDecoration: "underline" }}
                  >
                    <StyleTypeRef>Overload {n}</StyleTypeRef>
                  </a>
                  {"\n"}
                  <Def method={v} getLink={getLink} />
                </>
              );
            })
            .reduce((a, b) => <>{a}{"\n"}{b}</>)}
        </CodeBlock>
      )}
      {overloadCount && <H2>Overload {overloadCount}</H2>}
      {!overloadCount && <P doc getLink={getLink}>{func.jsDoc?.doc}</P>}
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
