import { ClassConstructorDef } from "deno_doc/types.d.ts";
import { CodeBlock } from "../CodeBlock.tsx";
import { Loc } from "../Loc.tsx";
import { P } from "../P.tsx";
import { Params } from "../TsType.tsx";
import { StyleKw } from "../styles.tsx";
import { LinkGetter } from "../types.ts";

export function Constructors({
  children: ctors,
  getLink,
}: {
  children: ClassConstructorDef[];
  getLink: LinkGetter;
}) {
  if (!ctors.length) {
    return null;
  }
  return (
    <>
      {ctors.map((v) => (
        <>
          <CodeBlock>
            {v.accessibility
              ? <StyleKw>{v.accessibility}{" "}</StyleKw>
              : undefined}
            <span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">
              {v.name}
            </span>(
            <Params getLink={getLink}>{v.params}</Params>);
          </CodeBlock>
          {"jsDoc" in v && <P doc>{v.jsDoc?.doc}</P>}
          <Loc>{v}</Loc>
        </>
      ))}
    </>
  );
}
