const denoToNode = {
  grammy_autoquote: "@roziscoding/grammy-autoquote",
};

export function urlsToIds(code: string): [string, Map<string, string>] {
  const importRegex =
    /(^import ?(?<imports>[^;\n]+)(?: ?)from (?<id>(?:'|")[^'"]+(?:'|"));?$)/gim;

  const imports = Array.from(code.matchAll(importRegex));

  if (!imports) return [code, new Map()];

  const replacedMap = Array.from(imports)
    .map((i) => i.groups?.id.replace(/"|'/g, ""))
    .map((url) =>
      Array.from(
        url!.includes("deno.land")
          ? url!.matchAll(/https:\/\/deno\.land\/x\/(?<id>[^@\/]+)[^\n]+/gi)
          : url!.matchAll(/https:\/\/esm\.sh\/(?<id>[^\n]+)$/gim),
      )
    )
    .filter((match) => !!match[0])
    .map((match) => [match[0].groups?.id || "", match[0][0]] as const)
    .filter(([id]) => !!id)
    .map(([id, url]) => [id in denoToNode ? denoToNode[id] : id, url])
    .reduce((map, [id, url]) => map.set(id!, url), new Map<string, string>());

  const replacedCode = Array.from(replacedMap.entries()).reduce(
    (code, [id, url]) => {
      return code.replace(url, id);
    },
    code,
  );

  return [replacedCode, replacedMap];
}

export function idsToUrls(code: string, replaceMap: Map<string, string>) {
  return Array.from(replaceMap.entries()).reduce(
    (code, [id, url]) => code.replace(id, url),
    code,
  );
}
