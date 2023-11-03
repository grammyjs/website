import { ComponentChildren } from "preact";
import { H2 } from "./H2.tsx";
import { P } from "./P.tsx";

export function Sector(
  { title, children, show }: {
    title: string;
    children?: ComponentChildren;
    show: boolean;
  },
) {
  if (!show) {
    return null;
  }
  return (
    <>
      <H2>{title}</H2>
      <P>{children}</P>
    </>
  );
}
