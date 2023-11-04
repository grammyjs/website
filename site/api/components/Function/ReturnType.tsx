import { JsDoc, JsDocTagReturn, TsTypeDef } from "deno_doc/types.d.ts";
import { LinkGetter } from "../types.ts";
import { H3 } from "../H3.tsx";
import { CodeBlock } from "../CodeBlock.tsx";
import { TsType } from "../TsType.tsx";
import { P } from "../P.tsx";

export function ReturnType(
  { children: ret, getLink, doc }: {
    children: TsTypeDef;
    getLink: LinkGetter;
    doc: JsDoc | undefined;
  },
) {
  return (
    <>
      <H3>Return Type</H3>
      <CodeBlock>
        <TsType getLink={getLink}>{ret}</TsType>
      </CodeBlock>
      <P>
        {doc?.tags?.find((v): v is JsDocTagReturn => v.kind == "return")?.doc}
      </P>
    </>
  );
}
