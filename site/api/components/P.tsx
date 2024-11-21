import { ComponentChildren } from "preact";
import { replaceModuleSymbolLinks } from "./util.ts";
import { ACTIVE_MODULE } from "../active_module.ts";

export function P(
  props: { children?: ComponentChildren; doc?: false; html?: true } | {
    children?: string;
    doc: true;
    anchors?: string[];
  },
) {
  if (props.doc && props.children) {
    const parts = props.children.split(/(```|```ts)/);
    const newParts = new Array<string>();
    let inCodeBlock = false;
    for (let part of parts) {
      if (part == "```" || part == "```ts" || part == "```ts:no-line-numbers") {
        inCodeBlock = !inCodeBlock;
        newParts.push(part);
        continue;
      }
      if (!inCodeBlock) {
        while (/<.+>/.test(part)) {
          part = part.replace(/<(.+)>/, "&lt;$1&gt;");
        }
        newParts.push(part);
      } else {
        newParts.push(part);
      }
    }
    props.children = newParts
      .join("")
      .replaceAll("```ts", "```ts:no-line-numbers");
    props.children = replaceModuleSymbolLinks(
      props.children,
      ACTIVE_MODULE,
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
