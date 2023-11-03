export interface ModuleConfig {
  user?: string;
  repo: string;
  branch?: string;
  slug: string;
  entrypoint?: string;
}

export const modules: ModuleConfig[] = [
  { repo: "grammY", slug: "core" },
  { repo: "grammY", slug: "api", entrypoint: "src/types.ts" },
  { repo: "menu", slug: "menu" },
  { repo: "runner", slug: "runner" },
  { repo: "hydrate", slug: "hydrate" },
  {
    repo: "transformer-throttler",
    branch: "master",
    slug: "transformer-throttler",
  },
  { repo: "ratelimiter", slug: "ratelimiter" },
  { repo: "files", slug: "files" },
  { repo: "router", slug: "router" },
  { repo: "emoji", slug: "emoji" },
  { repo: "parse-mode", slug: "parse-mode" },
  { repo: "conversations", slug: "conversations" },
  { user: "roziscoding", repo: "grammy-autoquote", slug: "autoquote" },
  { repo: "i18n", slug: "i18n" },
  {
    repo: "storages",
    slug: "storages/denodb",
    entrypoint: "packages/denodb/src/mod.ts",
  },
  {
    repo: "storages",
    slug: "storages/deta",
    entrypoint: "packages/deta/src/mod.ts",
  },
  {
    repo: "storages",
    slug: "storages/file",
    entrypoint: "packages/file/src/mod.ts",
  },
  {
    repo: "storages",
    slug: "storages/free",
    entrypoint: "packages/free/src/mod.ts",
  },
  {
    repo: "storages",
    slug: "storages/mongodb",
    entrypoint: "packages/mongodb/src/mod.ts",
  },
  {
    repo: "storages",
    slug: "storages/psql",
    entrypoint: "packages/psql/src/mod.ts",
  },
  {
    repo: "storages",
    slug: "storages/redis",
    entrypoint: "packages/redis/src/mod.ts",
  },
  {
    repo: "storages",
    slug: "storages/supabase",
    entrypoint: "packages/supabase/src/mod.ts",
  },
];
