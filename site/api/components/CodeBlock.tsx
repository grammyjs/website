import { ComponentChildren } from "preact";

export function CodeBlock({ children }: { children?: ComponentChildren }) {
  return (
    <>
      {"\n\n"}
      <div class="language-ts">
        {"\n\n"}
        <pre class="shiki dracula-soft">
            <code>{children}</code>
        </pre>
        {"\n\n"}
      </div>
      {"\n\n"}
    </>
  );
}
