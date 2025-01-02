export function PropertyName({
  children,
  hasType,
  "class": klass,
}: {
  // deno-lint-ignore no-explicit-any
  children: { name: string; optional: boolean } | { raw: any };
  hasType: boolean;
  class?: true;
}) {
  const optional = "raw" in children ? false : children.optional;
  return (
    <>
      <span style={klass ? "" : "--shiki-light:#24292E;--shiki-dark:#E1E4E8;"}>
        {"raw" in children ? children.raw : children.name}
      </span>
      {(optional || hasType) && (
        <span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">
          {optional && <>?</>}
          {hasType && <>:</>}
        </span>
      )}
    </>
  );
}
