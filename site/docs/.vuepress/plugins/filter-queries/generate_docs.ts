import { getFilters } from "./filter.ts";
import { dirname } from "https://deno.land/std@0.178.0/path/mod.ts";
import { TRANSLATIONS } from "./translations/mod.ts";

console.log("Generating filter query documentation...");

const {
  FILTER_QUERIES,
  UPDATE_KEYS,
  L1_SHORTCUTS,
  L2_SHORTCUTS,
} = await getFilters();

const CONTEXT_SHORTCUTS: Record<string, string> = UPDATE_KEYS
  .reduce((prev, current) => {
    return { ...prev, [current]: camelCase(current, "_") };
  }, {});

function camelCase(str: string, separator: string) {
  return str[0] +
    str.split(separator)
      .map((w) => w[0].toUpperCase() + w.substring(1))
      .join("").substring(1);
}

function generateDocs(translation: string) {
  const { title, introduction, generate, prefixDocs } =
    TRANSLATIONS[translation];

  const queryDocs: { query: string; doc: string }[] = [];

  for (const query of FILTER_QUERIES) {
    const [l1, l2, L3] = query.split(":");
    const L1 = L1_SHORTCUTS[l1] ?? [l1];
    const L2 = L2_SHORTCUTS[l2] ?? [l2];

    let doc = prefixDocs?.[query] ?? "";

    const L1Text = `\`${L1.join("`/`")}\``;
    const L2Text = `\`${L2.join("`/`")}\``;
    const L3Text = `\`${L3}\``;

    if (L1[0] && !L2[0] && !L3) {
      const accessInfo = "```ts:no-line-numbers\n" +
        L1.map((k1) => `ctx.${CONTEXT_SHORTCUTS[k1]};`).join("\n") + "\n```";
      doc += generate.L1(L1Text, accessInfo);
    } else if (L1[0] && L2[0] && !L3) {
      const accessInfo = "```ts:no-line-numbers\n" + L1.map((k1) =>
        L2.map((k2) =>
          `ctx.${CONTEXT_SHORTCUTS[k1]}.${k2};`
        ).join("\n")
      ).join("\n") + "\n```";
      doc += generate.L2(L1Text, L2Text, accessInfo);
    } else if (L1[0] && L2[0] && L3) {
      const accessInfo = "```ts:no-line-numbers\n" + (
        L2.join().includes("entities")
          ? `ctx.entities("${L3}");`
          : L1.map((k1) =>
            L2.map((k2) => `ctx.${CONTEXT_SHORTCUTS[k1]}.${k2}.${L3};`).join(
              "\n",
            )
          ).join("\n")
      ) +
        "\n```";
      doc += generate.L3(L1Text, L2Text, L3Text, accessInfo);
    } else {
      throw new Error(`There is some issue with the "${query}" filter query.`);
    }

    queryDocs.push({ query, doc });
  }

  const filterQueryDocs = queryDocs.map(({ query, doc }) => {
    return `::: details <code>${query}</code>\n\n${doc}\n:::`;
  }).join("\n\n");

  return `# ${title}\n\n${introduction}\n\n${filterQueryDocs}`;
}

const filepaths: string[] = [];

for (const translation in TRANSLATIONS) {
  const docs = generateDocs(translation);
  const path = `./docs${translation}resources/tools/filter-queries.md`;
  await Deno.mkdir(dirname(path), { recursive: true });
  await Deno.writeTextFile(path, docs);
  filepaths.push(path);
}

const fmtProcess = Deno.run({ cmd: ["deno", "fmt", "-q", ...filepaths] });
const { success } = await fmtProcess.status();
fmtProcess.close();
if (!success) console.log("Wrote generated files, but failed to format them");
else {
  console.log(
    "%cDone%c Written generated filter query docs",
    "color: green",
    "color: none",
  );
}
