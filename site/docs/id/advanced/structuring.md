---
prev: ./middleware.md
next: ./scaling.md
---

# Peningkatan I: Codebase Skala Besar

Ketika bot-mu terus berkembang dan semakin kompleks, kamu akan mengalami kesulitan dalam mengatur struktur codebase untuk aplikasimu.
Umumnya, kamu bisa membagi codebase menjadi beberapa file.

## Solusi yang Tersedia

> grammY masih cukup muda dan belum menyediakan integrasi resmi _DI container_.
> Ikuti [@grammyjs_news](https://t.me/grammyjs_news) untuk mendapatkan notifikasi ketika integrasi sudah tersedia.

Perlu dicatat bahwa tidak ada satu solusi yang cocok untuk semua orang, sehingga kamu dapat dengan bebas mengatur struktur kode sesukamu.
Berikut strategi yang sudah terbukti sesuai dalam penyusunan struktur kode.

1. Kelompokkan hal-hal yang saling berkaitan di dalam file yang sama (atau di direktori yang sama, tergantung dari seberapa besar kode kamu).
2. Buat sebuah instance bot terpusat yang menggabungkan semua middleware dengan cara memasangnya ke dalam bot.
3. (Opsional) Filter update secara terpusat terlebih dahulu, lalu sebar update dengan cara yang sesuai.
   Untuk melakukannya, silahkan cek `bot.route` ([API Reference](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0)) atau bisa juga menggunakan [plugin router](../plugins/router.md).

Contoh siap pakai yang mengimplementasikan strategi-strategi di atas bisa ditemukan di [Repositori Contoh Bot](https://github.com/grammyjs/examples/tree/main/scaling).

## Contoh Struktur

Untuk bot sederhana yang menangani _TODO list_, kamu bisa menggunakan struktur berikut.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` hanya diperuntukkan untuk mendefinisikan hal-hal yang berhubungan dengan item-item TODO, kemudian bagian kode tersebut akan digunakan di `list.ts`.

Di `list.ts`, kamu bisa melakukan hal seperti berikut:

```ts
export const lists = new Composer();

// Tambahkan beberapa handler di sini
// yang fungsinya mengatur middleware kamu seperti biasanya.
lists.on("message", async (ctx) => {/* ... */});
```

> Catatan: Jika menggunakan TypeScript, kamu perlu menambahkan [custom context type](../guide/context.md#memodifikasi-object-context)-nya juga ketika membuat sebuah composer.
> Contohnya, `new Composer<MyContext>()`.

Sebagai tambahan, kamu bisa menambahkan sebuah [error boundary](../guide/errors.md#error-boundary) untuk mengatasi semua error yang terjadi di dalam module-mu.

Sekarang, kamu bisa memasang module-nya di `bot.ts` seperti ini:

```ts
import { lists } from "./todo/list";

const bot = new Bot("");

bot.use(lists);
// ... kamu bisa menambahkan beberapa module seperti `todo` di sini

bot.start();
```

Cara lainnya, kamu bisa menggunakan [plugin router](../plugins/router.md) atau [`bot.route`](https://deno.land/x/grammy/mod.ts?s=Composer#method_route_0) untuk menggabungkan module-module yang berbeda dengan menentukan middleware mana yang akan digunakan di awal.

Yang perlu diingat adalah tidak ada satu cara mutlak untuk mengatur struktur bot kamu, karena masing-masing bot memiliki kasus yang berbeda.
Seperti biasa, pilih cara yang menurutmu paling sesuai dan cocok untuk bot kamu, karena kamulah sebagai pencipta yang paham mengenai seluk-beluk dari bot kamu. :wink:

## Type Definition untuk Middleware yang Telah Di-extract

Struktur di atas dapat bekerja dengan baik menggunakan sebuah composer.
Tetapi, di situasi tertentu kamu mungkin ingin meng-extract sebuah handler ke dalam sebuah function, alih-alih membuat sebuah composer baru lalu menambahkan logika ke dalamnya.
Untuk melakukannya, kamu perlu menambahkan type definition middleware yang sesuai ke handler terkait karena mereka tidak bisa lagi mengambilnya dari composer.

grammY meng-export type definition untuk semua **type middleware yang telah dikerucutkan**, misalnya sebuah middleware yang bisa kamu tambahkan ke command handler.
Selain itu, ia juga meng-export type definition beberapa **context object yang telah dikerucutkan** yang digunakan di middleware tersebut.
Kedua type tersebut parameternya ditulis ulang dengan [custom context object](../guide/context.md#memodifikasi-object-context) kamu.
Oleh karena itu, command handler akan memiliki type `CommandMiddleware<MyContext>` serta `CommandContext<MyContext>` di context objectnya.
Mereka bisa digunakan dengan cara seperti ini:

<CodeGroup>
  <CodeGroupItem title="Node.js" active>

```ts
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "grammy";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // menangani command handling
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // menangani callback query
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import {
  type CallbackQueryMiddleware,
  type CommandContext,
  type NextFunction,
} from "https://deno.land/x/grammy/mod.ts";

function commandMiddleware(ctx: CommandContext<MyContext>, next: NextFunction) {
  // menangani command handling
}
const callbackQueryMiddleware: CallbackQueryMiddleware<MyContext> = (ctx) => {
  // menangani callback query
};

bot.command(["start", "help"], commandMiddleware);
bot.callbackQuery("query-data", callbackQueryMiddleware);
```

</CodeGroupItem>
</CodeGroup>

Kunjungi [referensi API type aliases](https://deno.land/x/grammy/mod.ts#Type_Aliases) untuk melihat gambaran umum semua type aliases yang telah di-export oleh grammY.
