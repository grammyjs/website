import { ComponentChildren } from "preact";
import { H2 } from "./H2.tsx";
import { H3 } from "./H3.tsx";
import { P } from "./P.tsx";

export function Sector(
  { title, children, show, h3 }: {
    title: string;
    children?: ComponentChildren;
    show: boolean;
    h3?: boolean;
  },
) {
  if (!show) {
    return null;
  }
  return (
    <>
      {h3 ? <H3>{title}</H3> : <H2>{title}</H2>}
      <P>{children}</P>
    </>
  );
}
