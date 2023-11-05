import { Location } from "deno_doc/types.d.ts";

export function Loc(
  { children: { location } }: { children: { location: Location } },
) {
  return (
    <>
      {"\n\n"}
      <p class="src">
        <sup class="src">
          <a href={location.filename} target="blank" rel="noreferrer noopener">
            Source
          </a>
        </sup>
      </p>
      {"\n\n"}
    </>
  );
}
