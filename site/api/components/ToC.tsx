import { DocNode, DocNodeKind } from "@deno/doc/types";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";
import { Sector } from "./Sector.tsx";
import { LinkGetter } from "./types.ts";

function S(
  { title, children, getLink }: {
    title: string;
    children: { name: string }[];
    getLink: LinkGetter;
  },
) {
  return (
    <Sector title={title} show={!!children.length}>
      {children.map((v) => (
        <>
          {"- "}[{v.name}]({getLink(v.name)?.toLowerCase()}){"\n"}
        </>
      ))}
    </Sector>
  );
}

export function ToC(
  { children: nodes, name, description, getLink }: {
    children: DocNode[];
    name?: string;
    description?: string;
    getLink: LinkGetter;
  },
) {
  if (!nodes.length) {
    return null;
  }

  const set = new Set<`${string}_${string}`>();
  const k = (k: DocNodeKind) =>
    nodes.filter((v) => v.kind == k)
      .filter((v) =>
        !(set.has(`${v.kind}_${v.name}`) || void set.add(`${v.kind}_${v.name}`)) // remove overloads
      );

  return (
    <>
      {name && <H1>{name}</H1>}
      <P>{description}</P>
      <S getLink={getLink} title="Classes">{k("class")}</S>
      <S getLink={getLink} title="Variables">{k("variable")}</S>
      <S getLink={getLink} title="Functions">{k("function")}</S>
      <S getLink={getLink} title="Interfaces">{k("interface")}</S>
      <S getLink={getLink} title="Type Aliases">{k("typeAlias")}</S>
    </>
  );
}
