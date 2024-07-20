export function PropertyName({
  children: { name, optional },
  hasType,
  "class": klass,
}: {
  children: { name: string; optional: boolean };
  hasType: boolean;
  class?: true;
}) {
  return (
    <>
      <span style={klass ? "" : "--shiki-light:#24292E;--shiki-dark:#E1E4E8;"}>
        {name}
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
