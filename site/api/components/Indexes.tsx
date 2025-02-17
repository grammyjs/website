import {
  InterfaceIndexSignatureDef,
  ParamIdentifierDef,
} from "@deno/doc/types";
import { PropertyName } from "./PropertyName.tsx";
import { TsType } from "./TsType.tsx";
import { LinkGetter } from "./types.ts";
import { H3 } from "./H3.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { P } from "./P.tsx";
import { StyleKw } from "./styles.tsx";
import { Loc } from "./Loc.tsx";

export function Indexes({
  getLink,
  children: i,
}: {
  getLink: LinkGetter;
  children: InterfaceIndexSignatureDef[];
}) {
  return (
    <>
      {i.filter((v) =>
        "accessiblity" in v ? v.accessiblity !== "private" : true
      )
        .map((v) => (
          <>
            <H3>
              [{(v.params[0] as ParamIdentifierDef).name}:{" "}
              {v.params[0].tsType?.repr}]
            </H3>
            <CodeBlock>
              {"isStatic" in v && v.isStatic && <StyleKw>{"static "}</StyleKw>}
              {"isAbstract" in v && v.isAbstract && (
                <StyleKw>{"abstract "}</StyleKw>
              )}
              {v.readonly && <StyleKw>{"readonly "}</StyleKw>}
              <PropertyName hasType={!!v.tsType} class>
                {{
                  raw: (
                    <>
                      [{(v.params[0] as ParamIdentifierDef).name}
                      {v.params[0].tsType && (
                        <>
                          :{" "}
                          <TsType getLink={getLink}>
                            {v.params[0].tsType}
                          </TsType>
                        </>
                      )}]
                    </>
                  ),
                }}
              </PropertyName>
              {v.tsType && (
                <>
                  {" "}
                  <TsType getLink={getLink}>{v.tsType}</TsType>
                </>
              )};
            </CodeBlock>
            {/* @ts-ignore: it works */}
            {"jsDoc" in v && <P doc getLink={getLink}>{v.jsDoc}</P>}
            {/* @ts-ignore: this works too */}
            <Loc>{v}</Loc>
          </>
        ))}
    </>
  );
}
