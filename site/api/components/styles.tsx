import { ComponentChildren } from "preact";

export function StyleKw({ children }: { children?: ComponentChildren }) {
  return (
    <span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">{children}</span>
  );
}

export function StyleStrLit({ children }: { children?: ComponentChildren }) {
  return (
    <span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">{children}</span>
  );
}

export function StyleTypeRef({ children }: { children?: ComponentChildren }) {
  return (
    <span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">
      {children}
    </span>
  );
}

export function StyleCallee({ children }: { children?: ComponentChildren }) {
  return (
    <span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">{children}</span>
  );
}

export function StyleNum({ children }: { children?: ComponentChildren }) {
  return (
    <span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{children}</span>
  );
}
