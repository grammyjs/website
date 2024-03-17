import { ClassMethodDef, DocNodeFunction, JsDoc } from "deno_doc/types.d.ts";
import { Params, TsType, TypeParams_ } from "../TsType.tsx";
import { LinkGetter } from "../types.ts";
import { CodeBlock } from "../CodeBlock.tsx";
import { H3 } from "../H3.tsx";
import { P } from "../P.tsx";
import { Loc } from "../Loc.tsx";

export function Method({
  children: method,
  getLink,
  inheritDoc,
  overloads,
}: {
  children: ClassMethodDef;
  getLink: LinkGetter;
  inheritDoc: () => JsDoc | undefined;
  overloads?: ClassMethodDef[];
}) {
  const inherit = method.jsDoc?.tags?.some((v) =>
    v.kind == "unsupported" && v.value == "@inheritdoc"
  );
  const jsDoc = inherit ? inheritDoc() : method.jsDoc;
  return (
    <>
      <H3>
        {method.name}
        {method.kind == "getter"
          ? " (getter)"
          : method.kind == "setter"
          ? " (setter)"
          : ""}
      </H3>
      <CodeBlock>
        {overloads && !!overloads.length && "// Overload 1\n"}
        <Def method={method} getLink={getLink} />
        {overloads
          ?.slice(0, -1) // the last one is never exported
          .map((v, i) => (
            <>
              {`// Overload ${i + 2}\n`}
              <Def method={v} getLink={getLink} />
            </>
          ))}
      </CodeBlock>
      <P doc>{jsDoc?.doc}</P>
      <Loc>{method}</Loc>
    </>
  );
}

// used in Function.tsx
export function Def(
  { method, getLink }: {
    method: ClassMethodDef | DocNodeFunction;
    getLink: LinkGetter;
  },
) {
  return (
    <>
      {method.kind == "setter"
        ? <span style="color: #F286C4;">set{" "}</span>
        : method.kind == "getter"
        ? <span style="color: #F286C4;">get{" "}</span>
        : (
          ""
        )}
      <span style="color: #62E884">{method.name}</span>
      <TypeParams_ getLink={getLink}>
        {method.functionDef.typeParams}
      </TypeParams_>(
      <Params getLink={getLink}>{method.functionDef.params}</Params>)
      {method.functionDef.returnType
        ? (
          <span>
            :{" "}
            <TsType getLink={getLink}>
              {method.functionDef.returnType}
            </TsType>
          </span>
        )
        : (
          ""
        )}
      ;{"\n"}
    </>
  );
}
