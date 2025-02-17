import {
  type ClassConstructorParamDef,
  type ClassMethodDef,
  type ClassPropertyDef,
  type DocNodeClass,
  type JsDocTag,
  type ParamIdentifierDef,
} from "@deno/doc/types";
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
import { TsType, TypeRef } from "./TsType.tsx";
import { Loc } from "./Loc.tsx";
import { StyleKw } from "./styles.tsx";

function isVisible(
  v: ClassPropertyDef | ClassMethodDef | ClassConstructorParamDef,
) {
  return v.accessibility === undefined ||
    v.accessibility === "protected" || v.accessibility === "public";
}

export function Class(
  { children: klass, getLink: oldGetLink, parent }: {
    children: DocNodeClass;
    getLink: LinkGetter;
    parent: DocNodeClass | undefined;
  },
) {
  const typeParams = klass.classDef.typeParams;
  const ctors = klass.classDef.constructors;
  const props = klass.classDef.properties.filter(isVisible).concat(
    // display properties defined in the constructor
    ctors.flatMap((v) =>
      v.params
        .filter((p): p is ParamIdentifierDef =>
          p.kind === "identifier" &&
          (p.accessibility === "public" || p.accessibility === "protected")
        )
        .map((p): ClassPropertyDef => ({
          isAbstract: false,
          isStatic: false,
          readonly: false,
          location: v.location,
          jsDoc: {
            doc: v.jsDoc?.tags?.find((t): t is JsDocTag & { kind: "param" } =>
              t.kind === "param" && t.name === p.name
            )?.doc,
          },
          ...p,
        }))
    ),
  );
  const nonPrivateMethods = klass.classDef.methods.filter(isVisible);
  const methods = nonPrivateMethods.filter((v) => !v.isStatic);
  const staticMethods = nonPrivateMethods.filter((v) => v.isStatic);
  const getLink = newGetLink(oldGetLink, typeParams);

  const getMethodOverloads = (name: string) => {
    return methods.filter((v) => v.name == name).slice(1);
  };
  const getStaticMethodOverloads = (name: string) => {
    return staticMethods.filter((v) => v.name == name).slice(1);
  };

  const methodNameSet = new Set<string>(); // to prevent duplicates
  const staticMethodNameSet = new Set<string>();
  const anchors = methods.map((v) => v.name)
    .concat(staticMethods.map((v) => v.name));

  return (
    <>
      <H1>{klass.name}</H1>
      <P doc getLink={getLink} anchors={anchors}>{klass.jsDoc?.doc}</P>
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
      <Sector title="Implements" show={klass.classDef.implements.length > 0}>
        <CodeBlock>
          {klass.classDef.implements.length > 0 &&
            klass.classDef.implements.map((v) => (
              <TsType getLink={getLink}>{v}</TsType>
            )).reduce((a, b) => (
              (
                <>
                  {a}
                  <StyleKw>,</StyleKw> {b}
                </>
              )
            ))}
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
        {methods
          .filter((v) => {
            try {
              return !methodNameSet.has(v.name);
            } finally {
              methodNameSet.add(v.name);
            }
          })
          .map((v) => (
            <Method
              getLink={getLink}
              inheritDoc={() =>
                parent?.classDef.methods.find((v_) =>
                  (v_.name == v.name) && !v_.isStatic
                )?.jsDoc}
              overloads={getMethodOverloads(v.name)}
            >
              {v}
            </Method>
          ))}
      </Sector>
      <Sector title="Static Methods" show={!!staticMethods.length}>
        {staticMethods
          .filter((v) => {
            try {
              return !staticMethodNameSet.has(v.name);
            } finally {
              staticMethodNameSet.add(v.name);
            }
          })
          .map((v) => (
            <Method
              getLink={getLink}
              inheritDoc={() =>
                parent?.classDef.methods.find((v_) =>
                  (v_.name == v.name) && v_.isStatic
                )?.jsDoc}
              overloads={getStaticMethodOverloads(v.name)}
            >
              {v}
            </Method>
          ))}
      </Sector>
    </>
  );
}
