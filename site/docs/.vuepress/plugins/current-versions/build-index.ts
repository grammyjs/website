import { modules } from "../../../../modules.ts";

const urls = [
  ...modules.map(({ mod }) => `https://deno.land/x/${mod}`),
  "https://deno.land/std",
];

async function redirect(source: string) {
  const response = await fetch(source);
  const target = response.redirected ? response.url : source;
  return [`${source}/`, `${target}/`] as const;
}

const index = Object.fromEntries(await Promise.all(urls.map(redirect)));

console.log(JSON.stringify(index, null, 2));
