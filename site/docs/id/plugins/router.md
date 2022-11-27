# Router (`router`)

Class `Router` ([Referensi API](https://doc.deno.land/https://deno.land/x/grammy_router/router.ts)) berfungsi untuk mengatur rute suatu object context ke berbagai tempat di kode kamu.
Plugin ini serupa dengan `bot.route` di `Composer` ([grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer#route)), namun ia jauh lebih canggih.

## Contoh

Berikut contoh penggunaan router:

```ts
const router = new Router((ctx) => {
  // Tentukan rute yang akan dipilih di sini.
  return "key";
});

router.route("key", (ctx) => {/* ... */});
router.route("key-lainnya", (ctx) => {/* ... */});
router.otherwise((ctx) => {/* ... */}); // Akan dipanggil jika tidak ada rute yang sesuai

bot.use(router);
```

## Integrasi ke Middleware

Plugin router dapat diintegrasikan dengan [middleware tree](../advanced/middleware.md) grammY.
Contohnya, kamu bisa mem-filter update setelah mengatur rute mereka.

```ts
router.route("key").on("message:text", (ctx) => {/* ... */});

const other = router.otherwise();
other.on(":text", (ctx) => {/* ... */});
other.use((ctx) => {/* ... */});
```

Kamu mungkin juga tertarik untuk membaca materi lain mengenai [pengombinasian handler middleware.](../guide/filter-queries.md#mengombinasikan-query-dengan-method-lain)

## Mengombinasikan Router dengan Session

Router juga bisa dikombinasikan dengan [session](./session.md).
Misalnya, kamu dapat membuat kembali form di interface chat dengan mengombinasikan keduanya.

Anggaplah kamu ingin membuat sebuah bot yang memberitahu user berapa hari yang tersisa menuju ulang tahun mereka.
Untuk menghitung sisa hari tersebut, bot harus mengetahui tanggal serta bulan ulang tahun mereka.

Untuk mendapatkan informasi tersebut, bot perlu mengajukan dua pertanyaan:

1. User lahir di bulan apa?
2. User lahir di tanggal berapa?

Bot bisa memberi tahu user jumlah hari yang tersisa jika kedua hal tersebut diketahui.

Berikut cara implementasinya:

<CodeGroup>
  <CodeGroupItem title="TypeScript" active>

```ts
import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";
import { Router } from "@grammyjs/router";

interface SessionData {
  step: "idle" | "day" | "month"; // di tahap form mana kita berada
  dayOfMonth?: number; // tanggal ulang tahun
  month?: number; // bulan ulang tahun
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Gunakan session.
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Tentukan beberapa command.
bot.command("start", async (ctx) => {
  await ctx.reply(`Selamat datang!
Aku bisa memberi tahu kamu jumlah hari yang tersisa menuju hari ulang tahunmu!
Kirim /ulangtahun untuk memulai.`);
});

bot.command("ulangtahun", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Informasi sudah tersedia!
    await ctx.reply(
      `Ulang tahun kamu tinggal ${getDays(month, day)} hari lagi!`,
    );
  } else {
    // Informasi tidak tersedia, masuk ke mode form router
    ctx.session.step = "day";
    await ctx.reply(
"Kirim hari \
ulang tahunmu dalam format angka!",
    );
  }
});

// Gunakan router.
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Tentukan aksi yang akan dilakukan ketika berada di tahap form "day".
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Ups, itu bukan tanggal yang valid. Silahkan coba lagi!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Form lanjutan untuk step "month"
  ctx.session.step = "month";
  await ctx.reply("Baik! Sekarang, kirim bulannya!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply("Kirim tanggal ulang tahunmu dalam bentuk pesan teks!")
);

// Tentukan aksi yang akan dilakukan ketika menangani step "month".
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Kemungkinan besar tidak akan terjadi, kecuali data session-nya corrupt.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Kirimkan kembali tanggal ulang tahunmu!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"Ups, itu bukan bulan yang valid. \
Silahkan gunakan tombol berikut!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Kamu berulang tahun pada ${day} ${months[month]}.
Berarti, ulang tahunmu sisa ${diff} hari lagi!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Silahkan tekan salah satu tombol berikut!"));

// Tentukan aksi yang akan diambil untuk situasi lainnya.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Kirim /ulangtahun untuk mengetahui jumlah hari yang tersisa menuju hari ulang tahunmu.",
  );
});

bot.use(router); // register router-nya
bot.start();

// Konversi tanggal
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
  <CodeGroupItem title="JavaScript">

```js
const { Bot, Context, Keyboard, session, SessionFlavor } = require("grammy");
const { Router } = require("@grammyjs/router");

const bot = new Bot("");

// Gunakan session.
bot.use(session({ initial: () => ({ step: "idle" }) }));

// Tentukan beberapa command.
bot.command("start", async (ctx) => {
  await ctx.reply(`Selamat datang!
Aku bisa memberi tahu kamu jumlah hari yang tersisa menuju hari ulang tahunmu!
Kirim /ulangtahun untuk memulai.`);
});

bot.command("ulangtahun", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Informasi sudah tersedia!
    await ctx.reply(
      `Ulang tahun kamu tinggal ${getDays(month, day)} hari lagi!`,
    );
  } else {
    // Informasi tidak tersedia, masuk ke mode form router
    ctx.session.step = "day";
    await ctx.reply(
"Kirim tanggal \
ulang tahunmu dalam format angka!",
    );
  }
});

// Gunakan router.
const router = new Router((ctx) => ctx.session.step);

// Tentukan aksi yang akan dilakukan ketika berada di tahap form "day".
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Ups, itu bukan tanggal yang valid. Silahkan coba lagi!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Form lanjutan untuk step "month"
  ctx.session.step = "month";
  await ctx.reply("Baik! Sekarang, kirim bulannya!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply("Kirim tanggal ulang tahunmu dalam bentuk pesan teks!")
);

// Tentukan aksi yang akan dilakukan ketika menangani step "month".
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Kemungkinan besar tidak akan terjadi, kecuali data session-nya corrupt.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Kirimkan kembali tanggal ulang tahunmu!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"Ups, itu bukan bulan yang valid. \
Gunakan tombol berikut!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Kamu berulang tahun pada ${day} ${months[month]}.
Berarti, ulang tahunmu sisa ${diff} hari lagi!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Tekan salah satu tombol berikut!"));

// Tentukan aksi yang akan diambil untuk situasi lainnya.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Kirim /ulangtahun untuk mengetahui jumlah hari yang tersisa menuju hari ulang tahunmu.",
  );
});

bot.use(router); // register router-nya
bot.start();

// Konversi tanggal
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month, day) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
  <CodeGroupItem title="Deno">

```ts
import {
  Bot,
  Context,
  Keyboard,
  session,
  SessionFlavor,
} from "https://deno.land/x/grammy/mod.ts";
import { Router } from "https://deno.land/x/grammy_router/router.ts";

interface SessionData {
  step: "idle" | "day" | "month"; // di tahap form mana kita berada
  dayOfMonth?: number; // tanggal ulang tahun
  month?: number; // bulan ulang tahun
}
type MyContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<MyContext>("");

// Gunakan session.
bot.use(session({ initial: (): SessionData => ({ step: "idle" }) }));

// Tentukan beberapa command.
bot.command("start", async (ctx) => {
  await ctx.reply(`Selamat datang!
Aku bisa memberi tahu kamu jumlah hari yang tersisa menuju hari ulang tahunmu!
Kirim /ulangtahun untuk memulai.`);
});

bot.command("ulangtahun", async (ctx) => {
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  if (day !== undefined && month !== undefined) {
    // Informasi sudah tersedia!
    await ctx.reply(
      `Ulang tahun kamu tinggal ${getDays(month, day)} hari lagi!`,
    );
  } else {
    // Informasi tidak tersedia, masuk ke mode form router
    ctx.session.step = "day";
    await ctx.reply(
"Kirim tanggal \
ulang tahunmu dalam format angka!",
    );
  }
});

// Gunakan router.
const router = new Router<MyContext>((ctx) => ctx.session.step);

// Tentukan aksi yang akan dilakukan ketika berada di tahap form "day".
const day = router.route("day");
day.on("message:text", async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Ups, itu bukan tanggal yang valid. Silahkan coba lagi!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Form lanjutan untuk step "month"
  ctx.session.step = "month";
  await ctx.reply("Baik! Sekarang, kirim bulannya!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Jan").text("Feb").text("Mar").row()
        .text("Apr").text("May").text("Jun").row()
        .text("Jul").text("Aug").text("Sep").row()
        .text("Oct").text("Nov").text("Dec").build(),
    },
  });
});
day.use((ctx) =>
  ctx.reply("Kirim tanggal ulang tahunmu dalam bentuk pesan teks!")
);

// Tentukan aksi yang akan dilakukan ketika menangani step "month".
const month = router.route("month");
month.on("message:text", async (ctx) => {
  // Kemungkinan besar tidak akan terjadi, kecuali data session-nya corrupt.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Kirimkan kembali tanggal ulang tahunmu!");
    ctx.session.step = "day";
    return;
  }

  const month = months.indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
"Ups, itu bukan bulan yang valid. \
Silahkan gunakan tombol berikut!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Kamu berulang tahun pada ${day} ${months[month]}.
Berarti, ulang tahunmu sisa ${diff} hari lagi!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use((ctx) => ctx.reply("Silahkan tekan salah satu tombol berikut!"));

// Tentukan aksi yang akan diambil untuk situasi lainnya.
router.otherwise(async (ctx) => { // idle
  await ctx.reply(
    "Kirim /ulangtahun untuk mengetahui jumlah hari yang tersisa menuju hari ulang tahunmu.",
  );
});

bot.use(router); // register router-nya
bot.start();

// Konversi tanggal
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}
```

</CodeGroupItem>
</CodeGroup>

Perhatikan session di atas memiliki property `step` untuk menyimpan step dari form tersebut, misalnya untuk mengetahui value mana yang sedang diisi.
Router digunakan untuk berpindah antara middleware satu dengan lainnya ketika kedua isian `month` dan `dayOfMonth` telah terisi.
Ketika kedua nilai tersebut diketahui, bot akan menghitung sisa harinya lalu mengirim hasil perhitungan ke user.

## Ringkasan Plugin

- Nama: `router`
- Sumber: <https://github.com/grammyjs/router>
- Referensi: <https://doc.deno.land/https://deno.land/x/grammy_router/router.ts>
