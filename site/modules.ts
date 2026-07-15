export interface ModuleConfig {
  user?: string;
  repo: string;
  branch?: string;
  slug: string;
  entrypoint?: string;
  name: string;
  description: string;
  shortdescription: string;
}

function desc(main: string, source = main, type = "symbols", via = "") {
  return `This is the API reference for ${main}.
Below, you can see an auto-generated list of all the ${type} that ${source} exports${via}.`;
}
function sdesc(main: string) {
  return `API reference for ${main}.`;
}

export const modules: ModuleConfig[] = [
  {
    repo: "grammY",
    slug: "core",
    name: "Core API",
    description: desc("the grammY core library", "grammY"),
    shortdescription: sdesc("the grammY core library"),
  },
  {
    repo: "grammY",
    slug: "types",
    entrypoint: "src/types.ts",
    name: "Bot API Types",
    description: desc(
      "the Bot API types exported from grammY",
      "grammY",
      "Bot API types",
      "from `grammy/types`",
    ),
    shortdescription: sdesc("the Bot API types exported from `grammy/types`"),
  },
  {
    repo: "conversations",
    slug: "conversations",
    name: "Conversations",
    description: desc(
      "the [conversations plugin](/plugins/conversations)",
      "the conversations plugin",
    ),
    shortdescription: sdesc(
      "the [conversations plugin](/plugins/conversations)",
    ),
  },
  {
    repo: "menu",
    slug: "menu",
    name: "Menu Plugin",
    description: desc("the [menu plugin](/plugins/menu)", "the menu plugin"),
    shortdescription: sdesc("the [menu plugin](/plugins/menu)"),
  },
  {
    repo: "runner",
    slug: "runner",
    name: "grammY runner",
    description: desc("[grammY runner](/plugins/runner)", "grammY runner"),
    shortdescription: sdesc("[grammY runner](/plugins/runner)"),
  },
  {
    repo: "hydrate",
    slug: "hydrate",
    name: "Hydrate Plugin",
    description: desc(
      "the [hydrate plugin](/plugins/hydrate)",
      "the hydrate plugin",
    ),
    shortdescription: sdesc("the [hydrate plugin](/plugins/hydrate)"),
  },
  {
    repo: "auto-retry",
    slug: "auto-retry",
    name: "Auto-retry Plugin",
    description: desc(
      "the [auto-retry plugin](/plugins/auto-retry)",
      "the auto-retry plugin",
    ),
    shortdescription: sdesc("the [auto-retry plugin](/plugins/auto-retry)"),
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
    shortdescription: sdesc(
      "the [throttler plugin](/plugins/transformer-throttler)",
    ),
  },
  {
    repo: "ratelimiter",
    slug: "ratelimiter",
    name: "Ratelimiter Plugin",
    entrypoint: "mod.ts",
    description: desc(
      "the [ratelimiter plugin](/plugins/ratelimiter)",
      "the ratelimiter plugin",
    ),
    shortdescription: sdesc("the [ratelimiter plugin](/plugins/ratelimiter)"),
  },
  {
    repo: "files",
    slug: "files",
    name: "Files Plugin",
    description: desc("the [files plugin](/plugins/files)", "the files plugin"),
    shortdescription: sdesc("the [files plugin](/plugins/files)"),
  },
  {
    repo: "i18n",
    slug: "i18n",
    name: "Internationalization Plugin",
    description: desc(
      "the [internationalization plugin](/plugins/i18n)",
      "the internationalization plugin",
    ),
    shortdescription: sdesc("the [internationalization plugin](/plugins/i18n)"),
  },
  {
    repo: "commands",
    slug: "commands",
    name: "Commands",
    description: desc(
      "the [commands plugin](/plugins/commands)",
      "the commands plugin",
    ),
    shortdescription: sdesc("the [commands plugin](/plugins/commands)"),
  },
  {
    repo: "router",
    slug: "router",
    name: "Router Plugin",
    description: desc(
      "the [router plugin](/plugins/router)",
      "the router plugin",
    ),
    shortdescription: sdesc("the [router plugin](/plugins/router)"),
  },
  {
    repo: "emoji",
    slug: "emoji",
    name: "Emoji Plugin",
    description: desc("the [emoji plugin](/plugins/emoji)", "the emoji plugin"),
    shortdescription: sdesc("the [emoji plugin](/plugins/emoji)"),
  },
  {
    repo: "parse-mode",
    slug: "parse-mode",
    name: "Parse Mode Plugin",
    description: desc(
      "the [parse mode plugin](/plugins/parse-mode)",
      "the parse mode plugin",
    ),
    shortdescription: sdesc("the [parse mode plugin](/plugins/parse-mode)"),
  },
  {
    repo: "stream",
    slug: "stream",
    name: "Stream Plugin",
    description: desc(
      "the [stream plugin](/plugins/stream)",
      "the stream plugin",
    ),
    shortdescription: sdesc("the [stream plugin](/plugins/stream)"),
  },
  {
    repo: "chat-members",
    slug: "chat-members",
    name: "Chat Members",
    description: desc(
      "the [chat members plugin](/plugins/chat-members)",
      "the chat members plugin",
    ),
    shortdescription: sdesc("the [chat members plugin](/plugins/chat-members)"),
  },
];
