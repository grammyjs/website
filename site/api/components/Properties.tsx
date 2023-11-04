import {
  ClassPropertyDef,
  InterfacePropertyDef,
  LiteralPropertyDef,
} from "deno_doc/types.d.ts";
import { PropertyName } from "./PropertyName.tsx";
import { TsType } from "./TsType.tsx";
import { LinkGetter } from "./types.ts";
import { H3 } from "./H3.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { P } from "./P.tsx";

export function Properties({
  getLink,
  children: i,
}: {
  getLink: LinkGetter;
  children: InterfacePropertyDef[] | LiteralPropertyDef[] | ClassPropertyDef[];
}) {
  return (
    <>
      {i.map((v) => (
        <>
          <H3>{v.name}</H3>
          <CodeBlock>
            <PropertyName hasType={!!v.tsType} class>{v}</PropertyName>{" "}
            {v.tsType && <TsType getLink={getLink}>{v.tsType}</TsType>};
          </CodeBlock>
          {"jsDoc" in v && <P doc>{v.jsDoc?.doc}</P>}
        </>
      ))}
    </>
  );
}
