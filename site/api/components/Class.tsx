import { DocNodeClass } from "deno_doc/types.d.ts";
import { Method } from "./Class/Method.tsx";
import { Properties } from "./Properties.tsx";
import { Constructors } from "./Class/Constructors.tsx";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";
import { LinkGetter } from "./types.ts";
import { Sector } from "./Sector.tsx";
import { TypeParams } from "./TypeParams.tsx";
import { newGetLink } from "./util.ts";
import { CodeBlock } from "./CodeBlock.tsx";
import { TypeRef } from "./TsType.tsx";
import { Loc } from "./Loc.tsx";

export function Class(
  { children: klass, getLink: oldGetLink, parent }: {
    children: DocNodeClass;
    getLink: LinkGetter;
    parent: DocNodeClass | undefined;
  },
) {
  const typeParams = klass.classDef.typeParams;
  const ctors = klass.classDef.constructors;
  const props = klass.classDef.properties;
  const methods = klass.classDef.methods.filter((v) => !v.isStatic);
  const staticMethods = klass.classDef.methods.filter((v) => v.isStatic);
  const getLink = newGetLink(oldGetLink, typeParams);

  return (
    <>
      <H1>{klass.name}</H1>
      <P doc>{klass.jsDoc?.doc}</P>
      <Loc>{klass}</Loc>
      <Sector title="Extends" show={!!klass.classDef.extends}>
        <CodeBlock>
          <TypeRef getLink={getLink}>
            {{
              typeName: klass.classDef.extends!,
              typeParams: klass.classDef.superTypeParams,
            }}
          </TypeRef>
        </CodeBlock>
      </Sector>
      <Sector title="Type Parameters" show={!!typeParams.length}>
        <TypeParams getLink={getLink}>{typeParams}</TypeParams>
      </Sector>
      <Sector title="Constructors" show={!!ctors.length}>
        <Constructors getLink={getLink}>
          {ctors.map((v) => ({
            ...v,
            name: klass.name,
          }))}
        </Constructors>
      </Sector>
      <Sector title="Properties" show={!!props.length}>
        <Properties getLink={getLink}>{props}</Properties>
      </Sector>
      <Sector title="Methods" show={!!methods.length}>
        {methods.map((v) => (
          <Method
            getLink={getLink}
            inheritDoc={() =>
                parent?.classDef.methods.find((v_) => (v_.name == v.name) && !v_.isStatic)?.jsDoc}
          >
            {v}
          </Method>
        ))}
      </Sector>
      <Sector title="Static Methods" show={!!staticMethods.length}>
        {staticMethods.map((v) => (
          <Method
            getLink={getLink}
            inheritDoc={() =>
              parent?.classDef.methods.find((v_) => (v_.name == v.name) && v_.isStatic)?.jsDoc}
          >
            {v}
          </Method>
        ))}
      </Sector>
    </>
  );
}
