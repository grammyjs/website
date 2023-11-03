import { ComponentChildren } from "preact";

export function CodeBlock({ children }: { children?: ComponentChildren }) {
  return (
    <>
      {"\n\n"}
      <div class="language-ts">
        <pre class="shiki dracula-soft">
            <code>{children}</code>
        </pre>
      </div>
      {"\n\n"}
    </>
  );
}
