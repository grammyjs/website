import { type Location, TsTypeDef } from "../deps.ts";

export function loc({ filename, line }: Location) {
  return `${filename}?source#L${line}`;
}

export function annotate(type?: TsTypeDef) {
  return !type ? "" : ": " + getType(type);
}
export function getType(type: TsTypeDef): string {
  switch (type.kind) {
    case "array":
      return getType(type.array) + "[]";
    case "conditional":
      return type.conditionalType.checkType + " extends " +
        type.conditionalType.extendsType + " ? " +
        type.conditionalType.trueType + " : " + type.conditionalType.falseType;
    case "intersection":
      return type.intersection.map(getType).join(" & ");
    case "optional":
      return getType(type.optional) + "?";
    case "parenthesized":
      return "(" + getType(type.parenthesized) + ")";
    case "tuple":
      return `[${type.tuple.map(getType).join(", ")}]`;
    case "rest":
      return "..." + getType(type.rest);
    case "keyword":
      return type.repr;
    case "literal":
      switch (type.literal.kind) {
        case "bigInt":
          return type.literal.string + "n";
        case "boolean":
          return String(type.literal.boolean);
        case "number":
          return String(type.literal.number);
        case "string":
          return `"${type.literal.string}"`;
        case "template":
      }
      break;
    case "typeRef":
      return type.typeRef.typeName +
        (type.typeRef.typeParams?.length
          ? `<${type.typeRef.typeParams.map(getType).join(", ")}>`
          : "");
    case "union":
      return type.union.map(getType).join(" | ");
  }
  // TODO: add remaining cases
  return JSON.stringify(type);
}
