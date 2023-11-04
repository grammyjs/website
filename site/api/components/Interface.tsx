import { DocNodeInterface } from "deno_doc/types.d.ts";
import { Properties } from "./Properties.tsx";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";
import { LinkGetter } from "./types.ts";
import { Sector } from "./Sector.tsx";

export function Interface(
  { children: iface, getLink }: {
    children: DocNodeInterface;
    getLink: LinkGetter;
  },
) {
  const props = iface.interfaceDef.properties;

  return (
    <>
      <H1>{iface.name}</H1>
      <P doc>{iface.jsDoc?.doc}</P>
      <Sector title="Properties" show={!!props.length}>
        <Properties getLink={getLink}>{props}</Properties>
      </Sector>
    </>
  );
}
