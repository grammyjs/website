import { ComponentChildren } from "preact";
import { replaceModuleSymbolLinks } from "./util.ts";
import { LinkGetter } from "./types.ts";

export function P(
  props: { children?: ComponentChildren; doc?: false; html?: true } | {
    children?: string;
    doc: true;
    getLink: LinkGetter;
    anchors?: string[];
  },
) {
  if (props.doc && props.children) {
    props.children = props.children
      .replaceAll("```ts", "```ts:no-line-numbers");
    props.children = replaceModuleSymbolLinks(
      props.children,
      props.getLink,
      props.anchors,
    );
    return (
      <>
        {"\n\n"}
        <div
          dangerouslySetInnerHTML={{
            __html: "\n\n" + props.children + "\n\n",
          }}
        />
        {"\n\n"}
      </>
    );
  }
  if ("html" in props) {
    return (
      <div dangerouslySetInnerHTML={{ __html: props.children as string }}></div>
    );
  }
  return <>{"\n\n"}{props.children}{"\n\n"}</>;
}
