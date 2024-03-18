import { ComponentChildren } from "preact";

export function H1({ children }: { children?: ComponentChildren }) {
  return <># {children}{"\n"}</>;
}
