const denoToNode = {
  grammy_autoquote: "@roziscoding/grammy-autoquote",
};

export function urlsToIds(code: string): [string, Map<string, string>] {
  const importRegex =
    /(^import ?(?<imports>[^;]+)(?: ?)from (?<id>(?:'|")[^'"]+(?:'|"));?$)/img;

  const imports = code.match(importRegex);

  if (!imports) return [code, new Map()];

  const replacedMap = new Map<string, string>();

  imports.forEach((i) => {
    const urlMatch = /(?:"|')([^"']+)(?:"|')/.exec(i);

    /** If we can't find and extract the URL, return unaltered line */
    if (!urlMatch || !urlMatch[0] || !urlMatch[1]) return i;

    const url = urlMatch[1];

    const idMatch = url.match(/https:\/\/deno\.land\/x\/([^@]+)/i);

    /** If we can't find and extract the URL, return unaltered line */
    if (!idMatch || !idMatch[0] || !idMatch[1]) return i;

    const id = idMatch[1] in denoToNode ? denoToNode[idMatch[1]] : idMatch[1];

    replacedMap.set(id, url);
  });

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
