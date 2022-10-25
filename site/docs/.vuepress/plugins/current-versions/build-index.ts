import list from "../../../../modules.json" assert { type: "json" };

const urls = [
  ...Object.keys(list.modules).map((id) => `https://deno.land/x/${id}`),
  "https://deno.land/std",
];

async function redirect(source: string) {
  const response = await fetch(source);
  const target = response.redirected ? response.url : source;
  return [`${source}/`, `${target}/`] as const;
}

const index = Object.fromEntries(await Promise.all(urls.map(redirect)));

console.log(JSON.stringify(index, null, 2));
