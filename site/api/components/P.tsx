import { ComponentChildren } from "preact";

export function P({ children }: { children?: ComponentChildren }) {
  return <>{"\n\n"}{children}{"\n\n"}</>;
}
