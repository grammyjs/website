import {
  JsDoc,
  JsDocTagParam,
  ObjectPatPropDef,
  ParamDef,
} from "deno_doc/types.d.ts";
import { LinkGetter } from "../types.ts";
import { H3 } from "../H3.tsx";
import { CodeBlock } from "../CodeBlock.tsx";
import { Param } from "../TsType.tsx";
import { P } from "../P.tsx";

function getObjectPatPropTitle(prop: ObjectPatPropDef): string {
  switch (prop.kind) {
    case "assign":
      return prop.key +
        ((prop.value && prop.value != "[UNSUPPORTED]")
          ? ` = ${prop.value}`
          : "");
    case "keyValue":
      return prop.key + ": " + prop.value;
    case "rest":
      return "..." + getTitle(prop.arg);
  }
}

function getTitle(t: ParamDef): string {
  switch (t.kind) {
    case "identifier":
      return t.name;
    case "rest":
      return "..." + getTitle(t.arg);
    case "array":
      return "[" + t.elements
        .filter((v): v is NonNullable<typeof v> => !!v)
        .map((v) => getTitle(v))
        .join(", ") +
        "]";
    case "assign":
      return getTitle(t.left);
    case "object":
      return "{ " + t.props.map((v) => getObjectPatPropTitle(v)).join(", ") +
        " }";
  }
}

export function Parameters(
  { children: typeParams, getLink, doc }: {
    children: ParamDef[];
    getLink: LinkGetter;
    doc: JsDoc | undefined;
  },
) {
  return (
    <>
      {typeParams.map((v, i) => (
        <>
          <H3>{getTitle(v)}</H3>
          <CodeBlock>
            <Param getLink={getLink}>{v}</Param>
          </CodeBlock>
          <P doc>
            {doc?.tags?.find((v_): v_ is JsDocTagParam =>
              v_.kind == "param" && v_.name == getTitle(v)
            )?.doc}
          </P>
        </>
      ))}
    </>
  );
}
