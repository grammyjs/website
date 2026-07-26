import { ComponentChildren } from "preact";

export function MutedText(
  { small, children, italic, uppercase }: {
    small?: boolean;
    italic?: boolean;
    uppercase?: boolean;
    children?: ComponentChildren;
  },
) {
  return (
    <span
      class={`select-none opacity-50${small ? " text-xs" : ""}${
        uppercase ? " uppercase" : ""
      }${italic ? " italic" : ""}`}
    >
      {children}
    </span>
  );
}
