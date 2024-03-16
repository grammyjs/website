export interface ModuleConfig {
  user?: string;
  repo: string;
  branch?: string;
  slug: string;
  entrypoint?: string;
  name: string;
  description: string;
}

function desc(main: string, source = main, type = "symbols") {
  return `This is the API reference for ${main}.
Below, you can see an auto-generated list of all the ${type} that ${source} exports.`;
}

export const modules: ModuleConfig[] = [
  {
    repo: "grammY",
    slug: "core",
    name: "Core API",
    description: desc("the grammY core library", "grammY"),
  },
  {
    repo: "grammY",
    slug: "types",
    entrypoint: "src/types.ts",
    name: "Types",
    description: desc(
      "the Bot API types exported from grammY",
      "grammY",
      "Bot API types",
    ),
  },
  {
    repo: "conversations",
    slug: "conversations",
    name: "Conversations",
    description: desc(
      "the [conversations plugin](/plugins/conversations)",
      "the conversations plugin",
    ),
  },
  {
    repo: "menu",
    slug: "menu",
    name: "Menu Plugin",
    description: desc("the [menu plugin](/plugins/menu)", "the menu plugin"),
  },
  {
    repo: "runner",
    slug: "runner",
    name: "grammY runner",
    description: desc("[grammY runner](/plugins/runner)", "grammY runner"),
  },
  {
    repo: "hydrate",
    slug: "hydrate",
    name: "Hydrate Plugin",
    description: desc(
      "the [hydrate plugin](/plugins/hydrate)",
      "the hydrate plugin",
    ),
  },
  {
    repo: 'auto-retry',
    slug: 'auto-retry',
    name: 'Auto-retry Plugin',
    description: desc(
      "the [auto-retry plugin](/plugins/auto-retry)",
      "the auto-retry plugin",
    ),
  },
  {
    repo: "transformer-throttler",
    branch: "master",
    slug: "transformer-throttler",
    name: "Throttler Plugin",
    description: desc(
      "the [throttler plugin](/plugins/transformer-throttler)",
      "the throttler plugin",
    ),
  },
  {
    repo: "ratelimiter",
    slug: "ratelimiter",
    name: "Ratelimiter Plugin",
    description: desc(
      "the [ratelimiter plugin](/plugins/ratelimiter)",
      "the ratelimiter plugin",
    ),
  },
  {
    repo: "files",
    slug: "files",
    name: "Files Plugin",
    description: desc("the [files plugin](/plugins/files)", "the files plugin"),
  },
  {
    repo: "i18n",
    slug: "i18n",
    name: "Internationalization Plugin",
    description: desc(
      "the [internationalization plugin](/plugins/i18n)",
      "the internationalization plugin",
    ),
  },
  {
    repo: "router",
    slug: "router",
    name: "Router Plugin",
    description: desc(
      "the [router plugin](/plugins/router)",
      "the router plugin",
    ),
  },
  {
    repo: "emoji",
    slug: "emoji",
    name: "Emoji Plugin",
    description: desc("the [emoji plugin](/plugins/emoji)", "the emoji plugin"),
  },
  {
    repo: "parse-mode",
    slug: "parse-mode",
    name: "Parse Mode Plugin",
    description: desc(
      "the [parse mode plugin](/plugins/parse-mode)",
      "the parse mode plugin",
    ),
  },
  {
    repo: "chat-members",
    slug: "chat-members",
    name: "Chat Members",
    description: desc(
      "the [chat members plugin](/plugins/chat-members)",
      "the chat members plugin",
    ),
  },
  {
    repo: "storages",
    slug: "storages/denodb",
    entrypoint: "packages/denodb/src/mod.ts",
    name: "DenoDB Storage Adapter",
    description: desc("the DenoDB storage adapter"),
  },
  {
    repo: "storages",
    slug: "storages/deta",
    entrypoint: "packages/deta/src/mod.ts",
    name: "Deta Storage Adapter",
    description: desc("the Deta storage adapter"),
  },
  {
    repo: "storages",
    slug: "storages/file",
    entrypoint: "packages/file/src/mod.ts",
    name: "File Storage Adapter",
    description: desc("the file storage adapter"),
  },
  {
    repo: "storages",
    slug: "storages/free",
    entrypoint: "packages/free/src/mod.ts",
    name: "Free Storage Adapter",
    description: desc("the free storage adapter"),
  },
  {
    repo: "storages",
    slug: "storages/mongodb",
    entrypoint: "packages/mongodb/src/mod.ts",
    name: "MongoDB Storage Adapter",
    description: desc("the MongoDB storage adapter"),
  },
  {
    repo: "storages",
    slug: "storages/psql",
    entrypoint: "packages/psql/src/mod.ts",
    name: "PostgreSQL Storage Adapter",
    description: desc("the PostgreSQL storage adapter"),
  },
  {
    repo: "storages",
    slug: "storages/redis",
    entrypoint: "packages/redis/src/mod.ts",
    name: "Redis Storage Adapter",
    description: desc("the Redis storage adapter"),
  },
  {
    repo: "storages",
    slug: "storages/supabase",
    entrypoint: "packages/supabase/src/mod.ts",
    name: "Supabase Storage Adapter",
    description: desc("the Supabase storage adapter"),
  },
];
