import { ComponentChildren } from "preact";

export function P(
  props: { children?: ComponentChildren; doc?: false } | {
    children?: string;
    doc: true;
  },
) {
  if (props.doc && props.children) {
    props.children = props.children.replaceAll(
      /\n```(ts)\n/,
      "\n```ts:no-line-numbers\n",
    );
  }
  if (props.doc) {
    return (
      <>
        {"\n\n"}
        <div
          dangerouslySetInnerHTML={{
            __html: props.children
              ? `\n\n${
                props.children.replaceAll(">", "&gt;").replaceAll("<", "&lt;")
              }\n\n`
              : "",
          }}
        />
        {"\n\n"}
      </>
    );
  }
  return <>{"\n\n"}{props.children}{"\n\n"}</>;
}
