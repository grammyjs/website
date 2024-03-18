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
      <span style={klass ? "" : "color:#FFB86C;font-style:italic;"}>
        {name}
      </span>
      {(optional || hasType) && (
        <span style="color:#F286C4;">
          {optional && <>?</>}
          {hasType && <>:</>}
        </span>
      )}
    </>
  );
}
