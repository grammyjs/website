import { ComponentChildren } from "preact";

export function StyleKw({ children }: { children?: ComponentChildren }) {
  return <span style="color:#F286C4;">{children}</span>;
}

export function StyleStrLit({ children }: { children?: ComponentChildren }) {
  return <span style="color:#E7EE98;">{children}</span>;
}

export function StyleTypeRef({ children }: { children?: ComponentChildren }) {
  return (
    <span style="color:#97E1F1;font-style:italic;">
      {children}
    </span>
  );
}

export function StyleCallee({ children }: { children?: ComponentChildren }) {
  return <span style="color:#62E884">{children}</span>;
}

export function StyleNum({ children }: { children?: ComponentChildren }) {
  return <span style="color:#BF9EEE">{children}</span>;
}
