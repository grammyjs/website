import { DocNodeClass } from "deno_doc/types.d.ts";
import { Method } from "./Method.tsx";
import { Properties } from "./Properties.tsx";
import { Constructors } from "./Class/Constructors.tsx";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";
import { LinkGetter } from "./types.ts";
import { Sector } from "./Sector.tsx";
import { TypeParams } from "./TypeParams.tsx";
import { newGetLink } from "./util.ts";

export function Class(
  { children: klass, getLink: oldGetLink }: {
    children: DocNodeClass;
    getLink: LinkGetter;
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
      <P>{klass.jsDoc?.doc}</P>
      <Sector title="Constructors" show={!!ctors.length}>
        <Constructors getLink={getLink}>
          {ctors.map((v) => ({
            ...v,
            name: klass.name,
          }))}
        </Constructors>
      </Sector>
      <Sector title="Type Parameters" show={!!typeParams.length}>
        <TypeParams getLink={getLink}>{typeParams}</TypeParams>
      </Sector>
      <Sector title="Properties" show={!!props.length}>
        <Properties getLink={getLink}>{props}</Properties>
      </Sector>
      <Sector title="Methods" show={!!methods.length}>
        {methods.map((v) => <Method getLink={getLink}>{v}</Method>)}
      </Sector>
      <Sector title="Static Methods" show={!!staticMethods.length}>
        {staticMethods.map((v) => <Method getLink={getLink}>{v}</Method>)}
      </Sector>
    </>
  );
}
