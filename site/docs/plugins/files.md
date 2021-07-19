# File handling simplified in grammY

This plugin allows you to easily download files from Telegram servers, and to obtain a URL so you can download the file yourself.

## Downloading files

You need to pass your bot token to this plugin becuase it must authenticate as your bot when it downloads files.
This plugin then installs the `download` method on `getFile` call results.
Example:

<CodeGroup>
  <CodeGroupItem title="TS" active>

```ts
import { Bot, Context } from "grammy";
import { hydrateFiles, FileFlavor } from "@grammyjs/files";

// Transformative API flavor
type MyContext = FileFlavor<Context>;

// Create bot
const bot = new Bot<MyContext>("");

// Install plugin
bot.api.config.use(hydrateFiles(bot.token));

// Download videos and GIFs to temporary files
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare file for download
  const file = await ctx.getFile();
  // Download file to temporary location on your disk
  const path = await file.download();
  // Print file path
  console.log("File saved at", path);
});
```

 </CodeGroupItem>
 <CodeGroupItem title="JS">

```js
import { Bot } from "grammy";
import { hydrateFiles } from "@grammyjs/files";

// Create bot
const bot = new Bot("");

// Install plugin
bot.api.config.use(hydrateFiles(bot.token));

// Download videos and GIFs to temporary files
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare file for download
  const file = await ctx.getFile();
  // Download file to temporary location on your disk
  const path = await file.download();
  // Print file path
  console.log("File saved at", path);
});
```

 </CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateFiles,
  FileFlavor,
} from "https://deno.land/x/grammy_files/mod.ts";

// Transformative API flavor
type MyContext = FileFlavor<Context>;

// Create bot
const bot = new Bot<MyContext>("");

// Install plugin
bot.api.config.use(hydrateFiles(bot.token));

// Download videos and GIFs to temporary files
bot.on([":video", ":animation"], async (ctx) => {
  // Prepare file for download
  const file = await ctx.getFile();
  // Download file to temporary location on your disk
  const path = await file.download();
  // Print file path
  console.log("File saved at", path);
});
```

 </CodeGroupItem>
</CodeGroup>

You can pass a string with a file path to `download` if you don't want to create a temporary file. Just do `await file.download('/path/to/file')`.

If you only want to get the URL of the file so you can download it yourself, use `file.getUrl`. This will return a https link to your file that is valid for at least one hour.

### Local Bot API server

If you are using a local Bot API server, then the `getFile` call effectively downloads the file to your disk already.

In turn, you can call `file.getUrl()` to access that file path.
Note that `await file.download()` will now simply copy that locally present file to a temporary location (or to the given path if speciffied).

### Supporting `bot.api` calls

By default, the results of `await bot.api.getFile()` will also be equipped with `download` and `getUrl` methods.
However, this is not reflected in the types.
If you need these calls, you should also install an [API flavour](/advanced/transformers.html#api-flavouring) on the bot object called `FileApiFlavor`:

<CodeGroup>
  <CodeGroupItem title="Node" active>

```ts
import { Api, Bot, Context } from "grammy";
import { hydrateFiles, FileFlavor, FileApiFlavor } from "@grammyjs/files";

type MyContext = Context & FileFlavor;
type MyApi = Api & FileApiFlavor;

const bot = new Bot<MyContext, MyApi>("");
// etc
```

  </CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateFiles,
  FileFlavor,
  FileApiFlavor,
} from "https://deno.land/x/grammy_files/mod.ts";

type MyContext = FileFlavor<Context>;
type MyApi = FileApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");
// etc
```

  </CodeGroupItem>
</CodeGroup>

## Plugin summary

- Name: `files`
- Source: <https://github.com/grammyjs/files>
- Reference: <https://doc.deno.land/https/deno.land/x/grammy_files/mod.ts>
