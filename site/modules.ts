export interface ModuleConfig {
  user?: string;
  repo: string;
  branch?: string;
  slug: string;
  entrypoint?: string;
  name: string;
}

export const modules: ModuleConfig[] = [
  {
    repo: "grammY",
    slug: "core",
    name: "Core API",
  },
  // {
  //   repo: "grammY",
  //   slug: "types",
  //   entrypoint: "src/types.ts",
  //   name: "Types",
  // },
  // {
  //   repo: "menu",
  //   slug: "menu",
  //   name: "Menu Plugin",
  // },
  // {
  //   repo: "runner",
  //   slug: "runner",
  //   name: "grammY runner",
  // },
  // {
  //   repo: "hydrate",
  //   slug: "hydrate",
  //   name: "Hydrate Plugin",
  // },
  // {
  //   repo: "transformer-throttler",
  //   branch: "master",
  //   slug: "transformer-throttler",
  //   name: "Transformer Throttler",
  // },
  // {
  //   repo: "ratelimiter",
  //   slug: "ratelimiter",
  //   name: "Ratelimiter Plugin",
  // },
  // {
  //   repo: "files",
  //   slug: "files",
  //   name: "Files Plugin",
  // },
  // {
  //   repo: "router",
  //   slug: "router",
  //   name: "Router Plugin",
  // },
  // {
  //   repo: "emoji",
  //   slug: "emoji",
  //   name: "Emoji Plugin",
  // },
  // {
  //   repo: "parse-mode",
  //   slug: "parse-mode",
  //   name: "Parse Mode Plugin",
  // },
  // {
  //   repo: "conversations",
  //   slug: "conversations",
  //   name: "Conversations",
  // },
  // {
  //   user: "roziscoding",
  //   repo: "grammy-autoquote",
  //   slug: "autoquote",
  //   name: "Autoquote Plugin",
  // },
  // { repo: "i18n", slug: "i18n", name: "Internationalization Plugin" },
  // {
  //   repo: "storages",
  //   slug: "storages/denodb",
  //   entrypoint: "packages/denodb/src/mod.ts",
  //   name: "Internationalization Plugin",
  // },
  // {
  //   repo: "storages",
  //   slug: "storages/deta",
  //   entrypoint: "packages/deta/src/mod.ts",
  //   name: "Deta Storage Adapter",
  // },
  // {
  //   repo: "storages",
  //   slug: "storages/file",
  //   entrypoint: "packages/file/src/mod.ts",
  //   name: "File Storage Adapter",
  // },
  // {
  //   repo: "storages",
  //   slug: "storages/free",
  //   entrypoint: "packages/free/src/mod.ts",
  //   name: "Free Storage Adapter",
  // },
  // {
  //   repo: "storages",
  //   slug: "storages/mongodb",
  //   entrypoint: "packages/mongodb/src/mod.ts",
  //   name: "MongoDB Storage Adapter",
  // },
  // {
  //   repo: "storages",
  //   slug: "storages/psql",
  //   entrypoint: "packages/psql/src/mod.ts",
  //   name: "PostgreSQL Storage Adapter",
  // },
  // {
  //   repo: "storages",
  //   slug: "storages/redis",
  //   entrypoint: "packages/redis/src/mod.ts",
  //   name: "Redis Storage Adapter",
  // },
  // {
  //   repo: "storages",
  //   slug: "storages/supabase",
  //   entrypoint: "packages/supabase/src/mod.ts",
  //   name: "Supabase Storage Adapter",
  // },
];
