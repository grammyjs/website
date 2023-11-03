import { ClassConstructorDef } from "deno_doc/types.d.ts";
import { LinkGetter } from "../types.ts";
import { Params } from "../TsType.tsx";
import { CodeBlock } from "../CodeBlock.tsx";

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
  const items = ctors.map(({ accessibility, name, params }, i) => (
    <>
      {accessibility ? `${accessibility} ` : undefined}
      <span style="color: rgb(98, 232, 132);">{name}</span>(
      <Params getLink={getLink}>{params}</Params>);
      {"\n"}
    </>
  ));
  return <CodeBlock>{items}</CodeBlock>;
}
