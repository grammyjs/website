import {
  ClassMethodDef,
  DocNodeFunction,
  InterfaceMethodDef,
  JsDoc,
} from "deno_doc/types.d.ts";
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
  children: ClassMethodDef | InterfaceMethodDef;
  getLink: LinkGetter;
  inheritDoc: () => JsDoc | undefined;
  overloads?: (ClassMethodDef | InterfaceMethodDef)[];
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
    method: ClassMethodDef | DocNodeFunction | InterfaceMethodDef;
    getLink: LinkGetter;
  },
) {
  const typeParams = "functionDef" in method
    ? method.functionDef.typeParams
    : method.typeParams;
  const params = "functionDef" in method
    ? method.functionDef.params
    : method.params;
  const returnType = "functionDef" in method
    ? method.functionDef.returnType
    : method.returnType;
  return (
    <>
      {method.kind == "setter"
        ? (
          <span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">
            set{" "}
          </span>
        )
        : method.kind == "getter"
        ? (
          <span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">
            get{" "}
          </span>
        )
        : (
          ""
        )}
      <span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">
        {method.name}
      </span>
      <TypeParams_ getLink={getLink}>
        {typeParams}
      </TypeParams_>(
      <Params getLink={getLink}>{params}</Params>)
      {returnType
        ? (
          <span>
            :{" "}
            <TsType getLink={getLink}>
              {returnType}
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
