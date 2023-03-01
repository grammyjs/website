import type { Translation } from "./mod.ts";

export default {
  title: "Filter Queries Browser",
  introduction: `
Want to see all of the filter queries?
See in which scenarios they are useful?
This page lists all of them!
Click on a query to see the description.
Read the [filter query documentation](../../guide/filter-queries.md) to find more about them.`,
  generate: {
    L1: (L1, accessInfo) => `
Query for filtering ${L1} update.\n
Here is how you can access the information about the update:\n
${accessInfo}`,
    L2: (L1, L2, accessInfo) => `
Query for filtering ${L1} update with the field ${L2}.\n
Here is how you can access the properties of the field:\n
${accessInfo}`,
    L3: (L1, L2, L3, accessInfo) => {
      const isEntity = L2.includes("entities");
      const info0 = isEntity
        ? `containing at least one entity of the type ${L3}`
        : `with ${L3} property`;
      return `
Query for filtering ${L1} update with the field ${L2} ${info0}.\n
Here is how you can access the \
${isEntity ? `entities of ${L3} type` : `${L3} property`}:\n
${accessInfo}`;
    },
  },
  prefixDocs: {
    "chat_member":
      "**You need to specify this update in `allowed_updates` to receive them.**\n\n",
    "chat_join_request":
      "**You need to specify this update in `allowed_updates` to receive them.**\n\n",
  },
} as Translation;
