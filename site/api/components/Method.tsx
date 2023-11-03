import {
  ClassMethodDef,
  DocNodeInterface,
  ParamIdentifierDef,
} from "deno_doc/types.d.ts";
import { PropertyName } from "./PropertyName.tsx";
import { Params, TsType } from "./TsType.tsx";
import { LinkGetter } from "./types.ts";
import { CodeBlock } from "./CodeBlock.tsx";
import { H3 } from "./H2%20copy.tsx";

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
        <span style="color: #62E884">{method.name}</span>(
        <Params getLink={() => null}>{method.functionDef.params}</Params>)
        {method.functionDef.returnType
          ? (
            <span>
              :{" "}
              <TsType getLink={() => null}>
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
      {method.jsDoc?.doc}
      {"\n\n\n\n"}
    </>
  );
}
