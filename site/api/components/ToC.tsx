import { DocNode, DocNodeKind } from "deno_doc/types.d.ts";
import { H1 } from "./H1.tsx";
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
          {"- "}[{v.name}]({getLink(v.name)}){"\n"}
        </>
      ))}
    </Sector>
  );
}

export function ToC(
  { children: nodes, name, getLink }: {
    children: DocNode[];
    name?: string;
    getLink: LinkGetter;
  },
) {
  if (!nodes.length) {
    return null;
  }

  const k = (k: DocNodeKind) => nodes.filter((v) => v.kind == k);

  return (
    <>
      {name && <H1>{name}</H1>}
      <S getLink={getLink} title="Classes">{k("class")}</S>
      <S getLink={getLink} title="Variables">{k("variable")}</S>
      <S getLink={getLink} title="Functions">{k("function")}</S>
      <S getLink={getLink} title="Interfaces">{k("interface")}</S>
      <S getLink={getLink} title="Type Aliases">{k("typeAlias")}</S>
    </>
  );
}
