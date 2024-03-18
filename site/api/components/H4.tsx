import { ComponentChildren } from "preact";

export function H4({ children }: { children?: ComponentChildren }) {
  return <>#### {children}{"\n"}</>;
}
