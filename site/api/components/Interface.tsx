import { DocNodeInterface, DocNodeNamespace } from "deno_doc/types.d.ts";
import { Properties } from "./Properties.tsx";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";
import { LinkGetter } from "./types.ts";
import { Sector } from "./Sector.tsx";
import { Loc } from "./Loc.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { TsType } from "./TsType.tsx";
import { ToC } from "./ToC.tsx";

export function Interface(
  { children: iface, getLink, namespace }: {
    children: DocNodeInterface;
    getLink: LinkGetter;
    namespace?: DocNodeNamespace;
  },
) {
  const props = iface.interfaceDef.properties;

  return (
    <>
      <H1>{iface.name}</H1>
      <P doc>{iface.jsDoc?.doc}</P>
      <Loc>{iface}</Loc>
      <Sector title="Extends" show={!!iface.interfaceDef.extends.length}>
        <CodeBlock>
          {(() => {
            const a = iface.interfaceDef.extends.map((v) => (
              <TsType getLink={getLink}>{v}</TsType>
            ));
            return a.length > 0 ? a.reduce((a, b) => <>{a}, {b}</>) : null;
          })()}
        </CodeBlock>
      </Sector>
      <Sector title="Properties" show={!!props.length}>
        <Properties getLink={getLink}>{props}</Properties>
      </Sector>
      {namespace && (
        <ToC getLink={getLink}>{namespace.namespaceDef.elements}</ToC>
      )}
    </>
  );
}
