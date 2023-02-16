# TODO translate to Russian

# File Handling Simplified in grammY (`files`)

This plugin allows you to easily download files from Telegram servers, and to obtain a URL so you can download the file yourself.

## Downloading Files

You need to pass your bot token to this plugin because it must authenticate as your bot when it downloads files.
This plugin then installs the `download` method on `getFile` call results.
Example:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { FileFlavor, hydrateFiles } from "@grammyjs/files";

// Transformative Context flavor
type MyContext = FileFlavor<Context>;

// Create a bot.
const bot = new Bot<MyContext>("BOT_TOKEN");

// Use the plugin.
bot.api.config.use(hydrateFiles(bot.token));

// Download videos and GIFs to temporary locations.
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare the file for download.
  const file = await ctx.getFile();
  // Download the file to a temporary location.
  const path = await file.download();
  // Print the file path.
  console.log("File saved at ", path);
});
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";

// Create a bot.
const bot = new Bot("BOT_TOKEN");

// Use the plugin.
bot.api.config.use(hydrateFiles(bot.token));

// Download videos and GIFs to temporary locations.
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare the file for download.
  const file = await ctx.getFile();
  // Download the file to a temporary location.
  const path = await file.download();
  // Print the file path.
  console.log("File saved at ", path);
});
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

// Transformative Context flavor
type MyContext = FileFlavor<Context>;

// Create a bot.
const bot = new Bot<MyContext>("BOT_TOKEN");

// Use the plugin.
bot.api.config.use(hydrateFiles(bot.token));

// Download videos and GIFs to temporary locations.
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare the file for download.
  const file = await ctx.getFile();
  // Download the file to a temporary location.
  const path = await file.download();
  // Print the file path.
  console.log("File saved at ", path);
});
```

</CodeGroupItem>
</CodeGroup>

You can pass a string with a file path to `download` if you don't want to create a temporary file.
Just do `await file.download("/path/to/file")`.

If you only want to get the URL of the file so you can download it yourself, use `file.getUrl`.
This will return an HTTPS link to your file that is valid for at least one hour.

## Local Bot API Server

If you are using a [local Bot API server](https://core.telegram.org/bots/api#using-a-local-bot-api-server), then the `getFile` call effectively downloads the file to your disk already.

In turn, you can call `file.getUrl()` to access that file path.
Note that `await file.download()` will now simply copy that locally present file to a temporary location (or to the given path if specified).

## Supporting `bot.api` Calls

By default, the results of `await bot.api.getFile()` will also be equipped with `download` and `getUrl` methods.
However, this is not reflected in the types.
If you need these calls, you should also install an [API flavor](../advanced/transformers.md#api-flavoring) on the bot object called `FileApiFlavor`:

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import { Api, Bot, Context } from "grammy";
import { FileApiFlavor, FileFlavor, hydrateFiles } from "@grammyjs/files";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  FileApiFlavor,
  FileFlavor,
  hydrateFiles,
} from "https://deno.land/x/grammy_files/mod.ts";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// ...
```

</CodeGroupItem>
</CodeGroup>

## Plugin Summary

- Name: `files`
- Source: <https://github.com/grammyjs/files>
- Reference: <https://deno.land/x/grammy_files/mod.ts>
