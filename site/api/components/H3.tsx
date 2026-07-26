import { ComponentChildren } from "preact";

export function H3({ children }: { children?: ComponentChildren }) {
  return <>### {children}{"\n"}</>;
}
