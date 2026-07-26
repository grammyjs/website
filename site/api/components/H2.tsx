import { ComponentChildren } from "preact";

export function H2({ children }: { children?: ComponentChildren }) {
  return <>## {children}{"\n"}</>;
}
