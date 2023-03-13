# Plugin Hidrasi untuk grammY (`hydrate`)

Plugin ini akan menginstal method-method yang berguna di dua macam object, yaitu

- hasil dari pemanggilan API; serta
- object-object di context object `ctx`.

Daripada memanggil `ctx.api` atau `bot.api` lalu menyuplainya dengan berbagai identifier, dengan plugin ini kamu cukup memanggil method di object.
Mari kita lihat perbandingannya di contoh berikut.

**TANPA** plugin:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Memproses");
  await doWork(ctx.msg.photo); // Pemrosesan gambar yang butuh waktu lama
  await ctx.api.editMessageText(
    ctx.chat.id,
    statusMessage.message_id,
    "Selesai!",
  );
  setTimeout(
    () =>
      ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id).catch(
        () => {
          // Abaikan saat terjadi error.
        },
      ),
    3000,
  );
});
```

**DENGAN** plugin:

```ts
bot.on(":photo", async (ctx) => {
  const statusMessage = await ctx.reply("Memproses");
  await doWork(ctx.msg.photo); // Pemrosesan gambar yang butuh waktu lama
  await statusMessage.editText("Selesai!"); // Mudah sekali!
  setTimeout(() => statusMessage.delete().catch(() => {}), 3000);
});
```

Lebih rapi, bukan?

## Instalasi

Ada dua cara untuk menginstal plugin ini:

### Instalasi Sederhana

Plugin ini bisa diinstal secara langsung. Cara pemasangan yang seperti ini sudah cukup untuk kebanyakan pengguna.

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context } from "grammy";
import { hydrate, HydrateFlavor } from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
import { Bot } from "grammy";
import { hydrate } from "@grammyjs/hydrate";

const bot = new Bot(""); // <-- taruh token bot-mu diantara ""

bot.use(hydrate());
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrate,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;

const bot = new Bot<MyContext>("");

bot.use(hydrate());
```

</CodeGroupItem>
</CodeGroup>

### Pemasangan Tingkat Lanjut

Ketika menggunakan instalasi sederhana, hanya hasil dari pemanggilan API yang melalui `ctx.api` yang akan dihidrasi, contohnya `ctx.reply`.
Pemanggilan ini yang paling sering digunakan oleh kebanyakan bot.

Namun, beberapa bot mungkin perlu untuk memanggil `bot.api`.
Untuk kasus seperti itu, kamu sebaiknya menggunakan instalasi tingkat lanjut ini.

Instalasi ini akan mengintegrasikan context hydration dan hidrasi hasil pemanggilan API secara terpisah ke dalam bot kamu.
Perlu diingat bahwa kamu sekarang perlu menginstal sebuah [API flavor](../advanced/transformers.md#menggunakan-api-flavor).

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Api, Bot, Context } from "grammy";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "@grammyjs/hydrate";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

</CodeGroupItem>
 <CodeGroupItem title="JavaScript">

```js
import { Bot } from "grammy";
import { hydrateApi, hydrateContext } from "@grammyjs/hydrate";

const bot = new Bot(""); // <-- taruh token bot-mu diantara ""

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

</CodeGroupItem>
 <CodeGroupItem title="Deno">

```ts
import { Api, Bot, Context } from "https://deno.land/x/grammy/mod.ts";
import {
  hydrateApi,
  HydrateApiFlavor,
  hydrateContext,
  HydrateFlavor,
} from "https://deno.land/x/grammy_hydrate/mod.ts";

type MyContext = HydrateFlavor<Context>;
type MyApi = HydrateApiFlavor<Api>;

const bot = new Bot<MyContext, MyApi>("");

bot.use(hydrateContext());
bot.api.config.use(hydrateApi());
```

</CodeGroupItem>
</CodeGroup>

## Object Apa Saja yang Dihidrasi

Untuk saat ini, plugin menghidrasi

- pesan dan postingan channel;
- pesan yang diedit dan postingan channel yang diedit;
- callback query;
- inline query;
- hasil inline yang dipilih;
- web app query; dan
- pre-checkout serta shipping query.

Semua object dihidrasi di

- context object `ctx`;
- update object `ctx.update` di dalam context;
- shortcut untuk context object, misal `ctx.msg`; dan
- hasil pemanggilan API ketika diterapkan.

## Ringkasan Plugin

- Nama: `hydrate`
- Sumber: <https://github.com/grammyjs/hydrate>
- Referensi: <https://deno.land/x/grammy_hydrate/mod.ts>
