import { Ref } from "../types.ts";
import { H1 } from "./H1.tsx";
import { P } from "./P.tsx";

export function Overview({ refs }: { refs: Ref[] }) {
  return (
    <>
      <H1>API Reference</H1>
      <P>
        Welcome to the API reference of grammY. This is the auto-generated part
        of the documentation. It is derived from the source code comments of the
        core library and its ecosystem.
      </P>
      {refs
        .map(([, , slug, name, , shortdescription]) =>
          `- [${name}](./${slug.toLowerCase()}/): ${shortdescription}`
        )
        .join("\n")}
    </>
  );
}
