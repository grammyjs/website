import { DocNodeInterface, DocNodeNamespace } from "@deno/doc/types";
import { Properties } from "./Properties.tsx";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";
import { LinkGetter } from "./types.ts";
import { Sector } from "./Sector.tsx";
import { Loc } from "./Loc.tsx";
import { CodeBlock } from "./CodeBlock.tsx";
import { TsType } from "./TsType.tsx";
import { ToC } from "./ToC.tsx";
import { Method } from "./Class/Method.tsx";
import { Indexes } from "./Indexes.tsx";

export function Interface(
  { children: iface, getLink, namespace }: {
    children: DocNodeInterface;
    getLink: LinkGetter;
    namespace?: DocNodeNamespace;
  },
) {
  const props = iface.interfaceDef.properties;
  const methods = iface.interfaceDef.methods;
  const indexes = iface.interfaceDef.indexSignatures;
  const methodNameSet = new Set<string>(); // to prevent duplicates

  const getMethodOverloads = (name: string) => {
    return iface.interfaceDef.methods.filter((v) => v.name == name).slice(1);
  };

  return (
    <>
      <H1>{iface.name}</H1>
      <P doc getLink={getLink}>{iface.jsDoc?.doc}</P>
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
      <Sector title="Indexes" show={!!indexes.length}>
        <Indexes getLink={getLink}>{indexes}</Indexes>
      </Sector>
      <Sector title="Methods" show={!!methods.length}>
        {methods
          .filter((v) => {
            try {
              return !methodNameSet.has(v.name);
            } finally {
              methodNameSet.add(v.name);
            }
          })
          .map((v) => (
            <Method
              getLink={getLink}
              inheritDoc={() =>
                iface.interfaceDef.methods.find((v_) => (v_.name == v.name))
                  ?.jsDoc}
              overloads={getMethodOverloads(v.name)}
            >
              {v}
            </Method>
          ))}
      </Sector>
      {namespace && (
        <ToC getLink={getLink}>{namespace.namespaceDef.elements}</ToC>
      )}
    </>
  );
}
