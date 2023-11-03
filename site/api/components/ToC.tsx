import {
  DocNode,
  DocNodeClass,
  DocNodeFunction,
  DocNodeInterface,
  DocNodeKind,
} from "deno_doc/types.d.ts";
import { H1 } from "./H1.tsx";
import { Sector } from "./Sector.tsx";

function S(
  { title, children }: { title: string; children: { name: string }[] },
) {
  return (
    <Sector title={title} show={!!children.length}>
      {children.map((v) => (
        <>
          {"- "}[{v.name}](/ref/core/{v.name}){"\n"}
        </>
      ))}
    </Sector>
  );
}

export function ToC({ children: nodes }: { children: DocNode[] }) {
  if (!nodes.length) {
    return null;
  }

  const k = (k: DocNodeKind) => nodes.filter((v) => v.kind == k);

  return (
    <>
      <H1>Index</H1>
      <S title="Classes">{k("class")}</S>
      <S title="Variables">{k("variable")}</S>
      <S title="Functions">{k("function")}</S>
      <S title="Interfaces">{k("interface")}</S>
      <S title="Type Aliases">{k("typeAlias")}</S>
    </>
  );
}
