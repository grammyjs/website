import {
  LiteralCallSignatureDef,
  LiteralDef,
  LiteralIndexSignatureDef,
  LiteralMethodDef,
  LiteralPropertyDef,
  ObjectPatPropAssignDef,
  ObjectPatPropDef,
  ObjectPatPropKeyValueDef,
  ObjectPatPropRestDef,
  ParamArrayDef,
  ParamAssignDef,
  ParamDef,
  ParamIdentifierDef,
  ParamObjectDef,
  ParamRestDef,
  TsConditionalDef,
  TsFnOrConstructorDef,
  TsIndexedAccessDef,
  TsTypeDef,
  TsTypeLiteralDef,
  TsTypeOperatorDef,
  TsTypeParamDef,
  TsTypePredicateDef,
  TsTypeRefDef,
} from "deno_doc/types.d.ts";
import { JSX } from "preact/jsx-runtime";
import { PropertyName } from "./PropertyName.tsx";
import { LinkGetter } from "./types.ts";
import {
  StyleCallee,
  StyleKw,
  StyleNum,
  StyleStrLit,
  StyleTypeRef,
} from "./styles.tsx";

export function TsType({
  getLink,
  children: tt,
}: {
  getLink: LinkGetter;
  children: TsTypeDef;
}) {
  switch (tt.kind) {
    case "keyword":
      return <Keyword>{tt.keyword}</Keyword>;
    case "literal":
      return <Literal>{tt.literal}</Literal>;
    case "typeRef":
      return <TypeRef getLink={getLink}>{tt.typeRef}</TypeRef>;
    case "union":
      return <Union getLink={getLink}>{tt.union}</Union>;
    case "intersection":
      return <Intersection getLink={getLink}>{tt.intersection}</Intersection>;
    case "array":
      return <Array getLink={getLink}>{tt.array}</Array>;
    case "tuple":
      return <Tuple getLink={getLink}>{tt.tuple}</Tuple>;
    case "typeOperator":
      return <TypeOperator getLink={getLink}>{tt.typeOperator}</TypeOperator>;
    case "parenthesized":
      return <Parenthesized getLink={getLink}>{tt.parenthesized}
      </Parenthesized>;
    case "rest":
      return <Rest getLink={getLink}>{tt.rest}</Rest>;
    case "optional":
      return <Optional getLink={getLink}>{tt.optional}</Optional>;
    case "typeQuery":
      return <TypeQuery getLink={getLink}>{tt.typeQuery}</TypeQuery>;
    case "this":
      return <This />;
    case "fnOrConstructor":
      return (
        <FnOrConstructor getLink={getLink}>
          {tt.fnOrConstructor}
        </FnOrConstructor>
      );
    case "conditional":
      return <Conditional getLink={getLink}>{tt.conditionalType}</Conditional>;
    case "importType":
      break;
    case "infer":
      break;
    case "indexedAccess":
      return <IndexedAccess getLink={getLink}>{tt.indexedAccess}
      </IndexedAccess>;
    case "mapped":
      break;
    case "typeLiteral":
      return <TypeLiteral getLink={getLink}>{tt.typeLiteral}</TypeLiteral>;
    case "typePredicate":
      return <TypePredicate getLink={getLink}>{tt.typePredicate}
      </TypePredicate>;
  }
  return <>{tt.kind}</>;
}

function Keyword({ children: keyword }: { children: string }) {
  return <StyleTypeRef>{keyword}</StyleTypeRef>;
}

function Literal({ children: literal }: { children: LiteralDef }) {
  switch (literal.kind) {
    case "string":
      return <StyleStrLit>"{literal.string}"</StyleStrLit>;
    case "bigInt":
      return (
        <>
          <StyleNum>{literal.string}</StyleNum>
          <StyleKw>n</StyleKw>
        </>
      );
    case "number":
      return <StyleNum>{literal.number}</StyleNum>;
    case "boolean":
      return <StyleTypeRef>{literal.boolean.toString()}</StyleTypeRef>;
    case "template":
      break;
  }
  return <>{literal.kind}</>;
}

function TypeParams({
  children: typeParams,
  getLink,
}: {
  children: TsTypeDef[];
  getLink: LinkGetter;
}) {
  if (!typeParams.length) {
    return null;
  }
  return (
    <>
      &lt;
      {typeParams
        .map((v) => <TsType getLink={getLink}>{v}</TsType>)
        .reduce((a, b) => <>{a}, {b}</>)}
      &gt;
    </>
  );
}

export function TypeRef({
  getLink,
  children: typeRef,
}: {
  getLink: LinkGetter;
  children: TsTypeRefDef;
}) {
  const link = getLink(typeRef.typeName);
  let name: JSX.Element;
  if (link != null) {
    const differentOrigin = link.startsWith("http");
    name = (
      <a
        href={link}
        class="typeRef"
        style={{ textDecoration: "underline" }}
        target={differentOrigin ? "blank" : undefined}
        rel={differentOrigin ? undefined : "noopener noreferrer"}
      >
        <StyleTypeRef>{typeRef.typeName}</StyleTypeRef>
      </a>
    );
  } else {
    name = <StyleTypeRef>{typeRef.typeName}</StyleTypeRef>;
  }
  return (
    <>
      {name}
      {typeRef.typeParams && (
        <TypeParams getLink={getLink}>{typeRef.typeParams}</TypeParams>
      )}
    </>
  );
}

function Union({
  getLink,
  children: union,
}: {
  getLink: LinkGetter;
  children: TsTypeDef[];
}) {
  return union
    .map((v) => <TsType getLink={getLink}>{v}</TsType>)
    .reduce((a, b) => (
      <>
        {a} <StyleKw>|</StyleKw> {b}
      </>
    ));
}

function Intersection({
  getLink,
  children: intersection,
}: {
  getLink: LinkGetter;
  children: TsTypeDef[];
}) {
  return intersection
    .map((v) => <TsType getLink={getLink}>{v}</TsType>)
    .reduce((a, b) => (
      <>
        {a} <StyleKw>&</StyleKw> {b}
      </>
    ));
}

function Array({
  getLink,
  children: array,
}: {
  getLink: LinkGetter;
  children: TsTypeDef;
}) {
  return (
    <>
      <TsType getLink={getLink}>{array}</TsType>[]
    </>
  );
}

function Tuple({
  getLink,
  children: tuple,
}: {
  getLink: LinkGetter;
  children: TsTypeDef[];
}) {
  return (
    <>
      [{tuple
        .map((v) => <TsType getLink={getLink}>{v}</TsType>)
        .reduce((a, b) => <>{a}, {b}</>)}]
    </>
  );
}

function TypeOperator({
  getLink,
  children: typeOperator,
}: {
  getLink: LinkGetter;
  children: TsTypeOperatorDef;
}) {
  return (
    <>
      {typeOperator.operator}{" "}
      <TsType getLink={getLink}>{typeOperator.tsType}</TsType>
    </>
  );
}

function Parenthesized({
  getLink,
  children: parenthesized,
}: {
  getLink: LinkGetter;
  children: TsTypeDef;
}) {
  return (
    <>
      (<TsType getLink={getLink}>{parenthesized}</TsType>)
    </>
  );
}

function Rest({
  getLink,
  children: rest,
}: {
  getLink: LinkGetter;
  children: TsTypeDef;
}) {
  return (
    <>
      <StyleKw>...</StyleKw>
      <TsType getLink={getLink}>{rest}</TsType>
    </>
  );
}

function Optional({
  getLink,
  children: optional,
}: {
  getLink: LinkGetter;
  children: TsTypeDef;
}) {
  return (
    <>
      <TsType getLink={getLink}>{optional}</TsType>
    </>
  );
}

function TypeQuery({
  children: typeQuery,
}: {
  getLink: LinkGetter;
  children: string;
}) {
  return (
    <>
      <StyleKw>{"typeof "}</StyleKw>
      {typeQuery}
    </>
  );
}

function This() {
  return <StyleTypeRef>this</StyleTypeRef>;
}

export function TypeParam_({
  children: param,
  constraint = "extends",
  getLink,
}: {
  children: TsTypeParamDef;
  constraint?: string;
  getLink: LinkGetter;
}) {
  return (
    <>
      <>{param.name}</>
      {param.constraint && (
        <>
          <>{` ${constraint} `}</>
          <TsType getLink={getLink}>{param.constraint}</TsType>
        </>
      )}
      {param.default && (
        <>
          {" = "}
          <TsType getLink={getLink}>{param.default}</TsType>
        </>
      )}
    </>
  );
}

export function TypeParams_({
  children: params,
  getLink,
}: {
  children: TsTypeParamDef[];
  getLink: LinkGetter;
}) {
  if (!params.length) {
    return null;
  }
  const items = [];
  for (let i = 0; i < params.length; i++) {
    items.push(<TypeParam_ getLink={getLink}>{params[i]}</TypeParam_>);
    if (i < params.length - 1) {
      items.push(<>{", "}</>);
    }
  }
  return <>&lt;{items}&gt;</>;
}

function FnOrConstructor({
  children,
  getLink,
}: {
  children: TsFnOrConstructorDef;
  getLink: LinkGetter;
}) {
  const { constructor, typeParams, params, tsType } = children;
  return (
    <>
      {constructor ? <StyleKw>{"new "}</StyleKw> : ""}
      <TypeParams_ getLink={getLink}>{typeParams}</TypeParams_>(
      <Params getLink={getLink}>{params}</Params>) <StyleKw>=&gt;</StyleKw>{" "}
      <TsType getLink={getLink}>{tsType}</TsType>
    </>
  );
}

function Conditional({
  getLink,
  children: conditional,
}: {
  getLink: LinkGetter;
  children: TsConditionalDef;
}) {
  return (
    <>
      <TsType getLink={getLink}>{conditional.checkType}</TsType> <StyleKw>extends</StyleKw>{" "}
      <TsType getLink={getLink}>{conditional.extendsType}</TsType> <StyleKw>?</StyleKw>{" "}
      <TsType getLink={getLink}>{conditional.trueType}</TsType> <StyleKw>:</StyleKw>{" "}
      <TsType getLink={getLink}>{conditional.falseType}</TsType>
    </>
  );
}

function IndexedAccess(
  { children: { objType, indexType }, getLink }: {
    children: TsIndexedAccessDef;
    getLink: LinkGetter;
  },
) {
  return (
    <>
      <TsType getLink={getLink}>{objType}</TsType>[<TsType getLink={getLink}>
        {indexType}
      </TsType>]
    </>
  );
}

function LiteralIndexSignatures(
  { children: signatures, getLink }: {
    children: LiteralIndexSignatureDef[];
    getLink: LinkGetter;
  },
) {
  if (!signatures.length) {
    return null;
  }
  const items = signatures.map(({ params, readonly, tsType }) => {
    const item = (
      <>
        {readonly ? <StyleKw>{"readonly "}</StyleKw> : undefined}[<Params
          getLink={getLink}
        >
          {params}
        </Params>]{tsType && (
          <>
            : <TsType getLink={getLink}>{tsType}</TsType>
          </>
        )};{" "}
      </>
    );
    return <>{"  "}{item}</>;
  });
  return <>{"  "}{items}</>;
}

function LiteralCallSignatures(
  { children: items, getLink }: {
    children: LiteralCallSignatureDef[];
    getLink: LinkGetter;
  },
) {
  return (
    <>
      {items.map(({ typeParams, params, tsType }) => {
        const item = (
          <>
            <TypeParams_ getLink={getLink}>{typeParams}</TypeParams_>(<Params
              getLink={getLink}
            >
              {params}
            </Params>){tsType &&
              (
                <>
                  : <TsType getLink={getLink}>{tsType}</TsType>
                </>
              )};{" "}
          </>
        );
        return <>{"  "}{item}</>;
      })}
    </>
  );
}

function LiteralProperties(
  { children: props, getLink }: {
    children: LiteralPropertyDef[];
    getLink: LinkGetter;
  },
) {
  if (!props.length) {
    return null;
  }
  return (
    <>
      {props
        .map(({ name, readonly, computed, optional, tsType }) => (
          <>
            {readonly ? <StyleKw>{"readonly "}</StyleKw> : undefined}
            {computed ? `[${name}]` : name}
            {optional ? "?" : undefined}
            {tsType
              ? (
                <>
                  : <TsType getLink={getLink}>{tsType}</TsType>
                </>
              )
              : ""}
          </>
        ))
        .reduce((a, b) => <>{a}; {b}</>)}
    </>
  );
}

function LiteralMethods(
  { children: methods, getLink }: {
    children: LiteralMethodDef[];
    getLink: LinkGetter;
  },
) {
  return (
    <>
      {methods.map((
        { name, kind, optional, computed, returnType, typeParams, params },
        i,
      ) => {
        const item = (
          <>
            {kind === "getter"
              ? <StyleKw>{"get "}</StyleKw>
              : kind === "setter"
              ? <StyleKw>{"set "}</StyleKw>
              : undefined}
            {name === "new"
              ? <StyleKw>{name}{" "}</StyleKw>
              : computed
              ? `[${name}]`
              : <StyleCallee>{name}</StyleCallee>}
            {optional ? "?" : undefined}
            <TypeParams_ getLink={getLink}>{typeParams}</TypeParams_>(<Params
              indent="  "
              getLink={getLink}
            >
              {params}
            </Params>
            {params.length < 3 ? "" : "  "}
            ){returnType
              ? (
                <>
                  : <TsType getLink={getLink}>{returnType}</TsType>
                  {" "}
                </>
              )
              : ""}
          </>
        );
        return <>{(i == 0 ? "" : ";") + "\n  "}{item}</>;
      })}
    </>
  );
}

function TypeLiteral(
  { children: typeLiteral, getLink }: {
    children: TsTypeLiteralDef;
    getLink: LinkGetter;
  },
) {
  const { indexSignatures, callSignatures, properties, methods } = typeLiteral;
  const maxLen = indexSignatures.length + callSignatures.length +
    properties.length +
    methods.length;
  if (!maxLen) {
    return <>{"{}"}</>;
  }
  const multiline = maxLen >= 3;
  return (
    <>
      &#123;{multiline ? "\n" : " "}
      <LiteralIndexSignatures getLink={getLink}>
        {indexSignatures}
      </LiteralIndexSignatures>
      <LiteralCallSignatures getLink={getLink}>
        {callSignatures}
      </LiteralCallSignatures>
      <LiteralProperties getLink={getLink}>{properties}</LiteralProperties>
      <LiteralMethods getLink={getLink}>{methods}</LiteralMethods>
      {multiline ? "\n" : " "}
      &#125;
    </>
  );
}

function TypePredicate(
  { children: { asserts, param, type }, getLink }: {
    children: TsTypePredicateDef;
    getLink: LinkGetter;
  },
) {
  return (
    <>
      {asserts ? <StyleKw>{"asserts "}</StyleKw> : undefined}
      {param.type === "this" ? <StyleKw>this</StyleKw> : param.name}
      {type && (
        <>
          <StyleKw>{" is "}</StyleKw>
          <TsType getLink={getLink}>{type}</TsType>
        </>
      )}
    </>
  );
}

//#region params

function ParamArray({
  children: param,
  optional,
  getLink,
}: {
  children: ParamArrayDef;
  optional: boolean;
  getLink: LinkGetter;
}) {
  return (
    <>
      [{param.elements.map((e) => e && <Param getLink={getLink}>{e}</Param>)}]
      {param.optional || optional ? "?" : ""}
      {param.tsType && (
        <>
          : <TsType getLink={getLink}>{param.tsType}</TsType>
        </>
      )}
    </>
  );
}

function ParamAssign({
  children: param,
  getLink,
}: {
  children: ParamAssignDef;
  getLink: LinkGetter;
}) {
  return (
    <>
      <Param optional getLink={getLink}>
        {param.left}
      </Param>
      {param.tsType && <TsType getLink={getLink}>{param.tsType}</TsType>}
    </>
  );
}

function ParamIdentifier({
  children: param,
  optional,
  getLink,
}: {
  children: ParamIdentifierDef;
  optional: boolean;
  getLink: LinkGetter;
}) {
  return (
    <>
      <PropertyName hasType={!!param.tsType}>{param}</PropertyName>
      {param.tsType && (
        <>
          {" "}
          <TsType getLink={getLink}>{param.tsType}</TsType>
        </>
      )}
    </>
  );
}

function ObjectAssignPat({
  children: pattern,
}: {
  children: ObjectPatPropAssignDef;
  getLink: LinkGetter;
}) {
  return (
    <>
      {pattern.key}
      {pattern.value && pattern.value !== "[UNSUPPORTED]"
        ? `= ${pattern.value}`
        : undefined}
    </>
  );
}

function ObjectKeyValuePat({
  children,
  getLink,
}: {
  children: ObjectPatPropKeyValueDef;
  getLink: LinkGetter;
}) {
  return (
    <>
      {children.key}: <Param getLink={getLink}>{children.value}</Param>
    </>
  );
}

function ObjectRestPat({
  children,
  getLink,
}: {
  children: ObjectPatPropRestDef;
  getLink: LinkGetter;
}) {
  return (
    <>
      <StyleKw>...</StyleKw>
      <Param getLink={getLink}>{children.arg}</Param>
    </>
  );
}

function ObjectPat({
  children: pattern,
  getLink,
}: {
  children: ObjectPatPropDef;
  getLink: LinkGetter;
}) {
  switch (pattern.kind) {
    case "assign":
      return <ObjectAssignPat getLink={getLink}>{pattern}</ObjectAssignPat>;
    case "keyValue":
      return <ObjectKeyValuePat getLink={getLink}>{pattern}</ObjectKeyValuePat>;
    case "rest":
      return <ObjectRestPat getLink={getLink}>{pattern}</ObjectRestPat>;
  }
}

function ParamObject({
  children: param,
  optional,
  getLink,
}: {
  children: ParamObjectDef;
  optional: boolean;
  getLink: LinkGetter;
}) {
  const props = [];
  for (let i = 0; i < param.props.length; i++) {
    props.push(<ObjectPat getLink={getLink}>{param.props[i]}</ObjectPat>);
    if (i < param.props.length - 1) {
      props.push(<>{", "}</>);
    }
  }
  return (
    <>
      &#123; {props} &#125;{param.optional || optional ? "?" : ""}
      {param.tsType && (
        <>
          : <TsType getLink={getLink}>{param.tsType}</TsType>
        </>
      )}
    </>
  );
}

function ParamRest({
  children: param,
  getLink,
}: {
  children: ParamRestDef;
  getLink: LinkGetter;
}) {
  return (
    <>
      <StyleKw>...</StyleKw>
      <Param getLink={getLink}>{param.arg}</Param>
      {param.tsType && (
        <>
          : <TsType getLink={getLink}>{param.tsType}</TsType>
        </>
      )}
    </>
  );
}

export function Param({
  children: param,
  optional = false,
  getLink,
}: {
  children: ParamDef;
  optional?: boolean;
  getLink: LinkGetter;
}) {
  switch (param.kind) {
    case "array":
      return (
        <ParamArray getLink={getLink} optional={optional}>
          {param}
        </ParamArray>
      );
    case "assign":
      return <ParamAssign getLink={getLink}>{param}</ParamAssign>;
    case "identifier":
      return (
        <>
          <ParamIdentifier getLink={getLink} optional={optional}>
            {param}
          </ParamIdentifier>
        </>
      );
    case "object":
      return (
        <ParamObject getLink={getLink} optional={optional}>
          {param}
        </ParamObject>
      );
    case "rest":
      return <ParamRest getLink={getLink}>{param}</ParamRest>;
  }
}

export function Params({
  children: params,
  getLink,
  indent = "",
}: {
  children: ParamDef[];
  getLink: LinkGetter;
  indent?: string;
}) {
  if (!params.length) {
    return null;
  }

  if (params.length < 3) {
    const items = [];
    for (let i = 0; i < params.length; i++) {
      items.push(
        <>
          <Param getLink={getLink}>{params[i]}</Param>
        </>,
      );
      if (i < params.length - 1) {
        items.push(<>{", "}</>);
      }
    }
    return <>{items}</>;
  }
  return (
    <>
      {"\n  " + indent}
      {params
        .map((param) => <Param getLink={getLink}>{param}</Param>)
        .reduce((a, b) => (
          <>
            {a}
            {",\n  " + indent}
            {b}
          </>
        ))}
      {",\n"}
    </>
  );
}

//#endregion
