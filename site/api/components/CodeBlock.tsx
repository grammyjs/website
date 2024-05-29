import { ComponentChildren } from "preact";

export function CodeBlock({ children }: { children?: ComponentChildren }) {
  return (
    <>
      {"\n\n"}
      <div class="language-ts vp-adaptive-theme">
        <button title="Copy Code" class="copy"></button>
        <span class="lang">ts</span>
        {"\n\n"}
        <pre class="shiki shiki-themes github-light github-dark vp-code">
          <code style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{children}</code>
        </pre>
      </div>
      {"\n\n"}
    </>
  );
}
