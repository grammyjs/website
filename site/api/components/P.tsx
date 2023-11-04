import { ComponentChildren } from "preact";

export function P(
  { children, doc }: { children?: ComponentChildren; doc?: false } | {
    children?: string;
    doc: true;
  },
) {
  if (doc) {
    return (
      <>
        {"\n\n"}
        <p
          dangerouslySetInnerHTML={{
            __html: children ? `\n\n${children}\n\n` : "",
          }}
        />
        {"\n\n"}
      </>
    );
  }
  return <>{"\n\n"}{children}{"\n\n"}</>;
}
