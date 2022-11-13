import { type Location } from "./deps.ts";

export function loc({ filename, line }: Location) {
  return `${filename}?source#L${line}`;
}
