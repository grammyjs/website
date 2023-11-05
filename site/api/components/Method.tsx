import { ClassMethodDef } from "deno_doc/types.d.ts";
import { Params, TsType, TypeParams_ } from "./TsType.tsx";
import { LinkGetter } from "./types.ts";
import { CodeBlock } from "./CodeBlock.tsx";
import { H3 } from "./H3.tsx";
import { P } from "./P.tsx";

export function Method({
  children: method,
  getLink,
}: {
  children: ClassMethodDef;
  getLink: LinkGetter;
}) {
  return (
    <>
      <H3>
        {method.name}
        {method.kind == "getter"
          ? " (getter)"
          : method.kind == "setter"
          ? " (setter)"
          : ""}
      </H3>
      <CodeBlock>
        {method.kind == "setter"
          ? <span style="color: #F286C4;">set{" "}</span>
          : method.kind == "getter"
          ? <span style="color: #F286C4;">get{" "}</span>
          : (
            ""
          )}
        <span style="color: #62E884">{method.name}</span>
        <TypeParams_ getLink={getLink}>
          {method.functionDef.typeParams}
        </TypeParams_>(
        <Params getLink={getLink}>{method.functionDef.params}</Params>)
        {method.functionDef.returnType
          ? (
            <span>
              :{" "}
              <TsType getLink={getLink}>
                {method.functionDef.returnType}
              </TsType>
            </span>
          )
          : (
            ""
          )}
        ;
      </CodeBlock>
      {"\n\n"}
      <P doc>{method.jsDoc?.doc}</P>
      {"\n\n\n\n"}
    </>
  );
}
