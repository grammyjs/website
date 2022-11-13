export interface ModuleConfig {
  mod: string;
  slug: string;
  entrypoint?: string;
}

export const modules: ModuleConfig[] = [
  { mod: "grammy", slug: "core" },
  { mod: "grammy", slug: "api", entrypoint: "types.ts" },
  { mod: "grammy_menu", slug: "menu" },
  { mod: "grammy_runner", slug: "runner" },
  { mod: "grammy_hydrate", slug: "hydrate" },
  { mod: "grammy_transformer_throttler", slug: "transformer-throttler" },
  { mod: "grammy_ratelimiter", slug: "ratelimiter" },
  { mod: "grammy_files", slug: "files" },
  { mod: "grammy_router", slug: "router" },
  { mod: "grammy_emoji", slug: "emoji" },
  { mod: "grammy_parse_mode", slug: "parse-mode" },
  { mod: "grammy_conversations", slug: "conversations" },
  { mod: "grammy_autoquote", slug: "autoquote" },
  { mod: "grammy_i18n", slug: "i18n" },
  {
    mod: "grammy_storages",
    slug: "storages/denodb",
    entrypoint: "denodb/src/mod.ts",
  },
  {
    mod: "grammy_storages",
    slug: "storages/deta",
    entrypoint: "deta/src/mod.ts",
  },
  {
    mod: "grammy_storages",
    slug: "storages/file",
    entrypoint: "file/src/mod.ts",
  },
  {
    mod: "grammy_storages",
    slug: "storages/free",
    entrypoint: "free/src/mod.ts",
  },
  {
    mod: "grammy_storages",
    slug: "storages/mongodb",
    entrypoint: "mongodb/src/mod.ts",
  },
  {
    mod: "grammy_storages",
    slug: "storages/psql",
    entrypoint: "psql/src/mod.ts",
  },
  {
    mod: "grammy_storages",
    slug: "storages/redis",
    entrypoint: "redis/src/mod.ts",
  },
  {
    mod: "grammy_storages",
    slug: "storages/supabase",
    entrypoint: "supabase/src/mod.ts",
  },
];
