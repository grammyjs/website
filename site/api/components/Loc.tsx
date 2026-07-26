import { Location } from "@deno/doc/types";

export function Loc(
  { children: { location } }: { children: { location: Location } },
) {
  const url = new URL(location.filename);
  if (url.hostname == "raw.githubusercontent.com") {
    url.hostname = "github.com";
    url.pathname = url.pathname.split("/")
      .filter((v) => v)
      .slice(0, 2)
      .concat(["blob"], url.pathname.split("/").filter((v) => v).slice(2))
      .join("/");
    url.hash = `#L${location.line}`;
  }
  return (
    <>
      {"\n\n"}
      <p class="src">
        <sup class="src">
          <a
            href={url.toString()}
            target="blank"
            rel="noreferrer noopener"
          >
            Source
          </a>
        </sup>
      </p>
      {"\n\n"}
    </>
  );
}
