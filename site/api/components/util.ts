import { TsTypeParamDef } from "@deno/doc/types";

export function newGetLink(
  oldGetLink: (r: string) => string | null,
  typeParams: TsTypeParamDef[],
) {
  return (r: string) => {
    const l = oldGetLink(r);
    if (l == null) {
      if (typeParams.map((v) => v.name).includes(r)) {
        return "#" + r.toLowerCase();
      }
    }
    return l;
  };
}
