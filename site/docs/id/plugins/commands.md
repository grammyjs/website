---
prev: false
next: false
---

# Perintah (`commands`)

Paket lengkap penanganan perintah (command).

Plugin ini menyediakan berbagai fitur tambahan yang tidak tersedia di
[library inti](../guide/commands). Berikut manfaat yang dapat kamu peroleh:

- Kode jadi lebih mudah dibaca.
- Sinkronisasi menu perintah user melalui `setMyCommands`.
- Perintah lebih tertata karena dapat dikelompokkan.
- Penerapan perintah untuk lingkup tertentu saja, misalnya diatur hanya tersedia
  untuk admin grup atau channel, dsb.
- Penerjemahan perintah.
- Fitur `Mungkin maksud Anda ...?` yang akan membantu menemukan perintah yang
  dimaksud ketika user salah ketik.
- Pencocokan perintah yang tidak peka huruf kapital (case-insensitive).
- Perilaku tersuai untuk perintah yang secara eksplisit terkandung di mention
  bot, seperti `/start@bot_kamu`.
- Awalan perintah bisa diubah, misalnya diganti menjadi `+`, `?`, `!`, dsb
  (semua simbol selain `/`).
- Mampu mendeteksi perintah yang tidak terletak di awal pesan.
- RegExp didukung!

Semua fitur di atas dapat dicapai karena nantinya kamu diharuskan membuat
struktur perintah yang sedemikian rupa untuk bot kamu.

## Penggunaan Dasar

Sebelum memulai, mari kita lihat cara mendaftarkan sebuah perintah menggunakan
plugin ini:

```ts
const myCommands = new CommandGroup();

myCommands.command("halo", "Ucapkan salam", (ctx) => ctx.reply(`Halo, dunia!`));

bot.use(myCommands);
```

Kode tersebut akan mendaftarkan perintah `/halo` ke bot kamu, yang kemudian akan
diteruskan ke middleware terkait.

Sekarang, mari kita pelajari alat-alat tambahan yang tersedia di plugin ini.

## Melakukan Import

Berikut cara meng-import semua class beserta type yang diperlukan:

::: code-group

```ts [TypeScript]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
```

```js [JavaScript]
const { CommandGroup, commands, commandNotFound } = require(
  "@grammyjs/commands",
);
```

```ts [Deno]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "https://deno.land/x/grammy_commands/mod.ts";
```

:::

Semua import yang diperlukan sudah disusun. Sekarang, mari kita cari tahu cara
menampilkan perintah ke user.

## Mengatur Menu Perintah User

Setelah perintah dibuat menggunakan sebuah instansiasi class `CommandGroup`,
sekarang kamu bisa memanggil method `setCommands`. Method tersebut bertugas
untuk mendaftarkan seluruh perintah tadi ke bot kamu.

```ts
const myCommands = new CommandGroup();

myCommands.command(
  "halo",
  "Ucapkan salam",
  (ctx) => ctx.reply("Halo, semuanya!"),
);
myCommands.command("start", "Mulai bot", (ctx) => ctx.reply("Memulai..."));

bot.use(myCommands);

await myCommands.setCommands(bot);
```

Kode di atas akan menampilkan setiap perintah ke menu yang berada di chat
pribadi bot kamu, atau setiap kali user mengetik `/` di sebuah chat yang di
dalamnya terdapat bot kamu juga.

### Pintasan Context

Bagaimana jika kamu ingin menampilkan perintah ke user tertentu saja? Misalnya,
bayangkan kamu memiliki sebuah perintah `login` dan `logout`. Perintah `login`
seharusnya hanya ditampilkan ketika user logout, dan sebaliknya. Berikut cara
mengatasinya menggunakan plugin commands:

::: code-group

```ts [TypeScript]
// Gunakan flavor untuk context tersuai.
type MyContext = Context & CommandsFlavor;

// Gunakan context yang telah dibuat untuk menginisiasi bot kamu.
const bot = new Bot<MyContext>("token");

// Daftarkan pintasan context-nya.
bot.use(commands());

// Perintah untuk logout.
const loggedOutCommands = new CommandGroup();
// Perintah untuk login.
const loggedInCommands = new CommandGroup();

// Tampilkan perintah masuk (login) ketika user keluar (logout).
loggedOutCommands.command(
  "login",
  "Mulai sesi baru",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("Selamat datang! Sesi telah dimulai!");
  },
);

// Tampilkan perintah keluar (logout) ketika user masuk (login).
loggedInCommands.command(
  "logout",
  "Akhiri sesi",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Sampai jumpa :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// Secara bawaan, user tidak login.
// Oleh karena itu, kamu bisa menyetel perintah logout ke semua orang.
await loggedOutCommands.setCommands(bot);
```

```js [JavaScript]
// Daftarkan pintasan context-nya.
bot.use(commands());

// Perintah untuk logout.
const loggedOutCommands = new CommandGroup();
// Perintah untuk login.
const loggedInCommands = new CommandGroup();

// Tampilkan perintah masuk (login) ketika user keluar (logout).
loggedOutCommands.command(
  "login",
  "Mulai sesi baru",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("Selamat datang! Sesi telah dimulai!");
  },
);

// Tampilkan perintah keluar (logout) ketika user masuk (login).
loggedInCommands.command(
  "logout",
  "Akhiri sesi",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Sampai jumpa :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// Secara bawaan, user tidak login.
// Oleh karena itu, kamu bisa menyetel perintah logout ke semua orang.
await loggedOutCommands.setCommands(bot);
```

:::

Dengan demikian, ketika user memanggil `/login`, daftar perintah mereka akan
berubah menjadi perintah `logout`. Keren, bukan?

::: danger Ketentuan untuk Nama Perintah Seperti yang telah diutarakan di
[dokumentasi API Bot Telegram](https://core.telegram.org/bots/api#botcommand),
nama perintah hanya boleh terdiri atas:

> 1-32 karakter. Karakter yang diperbolehkan hanya huruf abjad non-kapital
> (a-z), angka (0-9), dan garis bawah (_).

Itulah kenapa, pemanggilan `setCommands` atau `setMyCommands` di luar ketentuan
di atas menyebabkan sebuah galat atau error. Perintah yang tidak mengikuti
ketentuan tersebut masih bisa ditambahkan, digunakan, dan ditangani, tetapi
tidak akan pernah bisa ditampilkan di menu user. :::

**Perlu diketahui** bahwa `setCommands` dan `setMyCommands` hanya akan berdampak
ke tampilan visual di menu perintah user, mereka tidak berdampak ke hak
aksesnya. Kamu akan mempelajari cara menerapkan akses terbatas untuk perintah
tertentu di bagian [Lingkup Command](#lingkup-perintah).

### Pengelompokan Perintah

Karena kita bisa membagi dan mengelompokkan perintah menjadi beberapa bagian,
maka penataan perintah ke bebeberapa file terpisah juga bisa dilakukan.

Sebagai contoh, kita ingin perintah tertentu hanya tersedia untuk para developer
saja. Kita bisa melakukannya menggunakan struktur kode berikut:

```ascii
src/
├─ commands/
│  ├─ admin.ts
│  ├─ users/
│  │  ├─ grup.ts
│  │  ├─ salam-sambutan.ts
│  │  ├─ salam-perpisahan.ts
│  │  ├─ ...
├─ bot.ts
├─ types.ts
tsconfig.json
```

Berikut contoh kode untuk membuat grup perintah yang hanya tersedia untuk
developer, serta memperbarui menu perintah di aplikasi Telegram user. Perhatikan
perbedaan pola yang digunakan di tab `admin.ts` dan `group.ts`.

::: code-group

```ts [types.ts]
export type MyContext = Context & CommandsFlavor<MyContext>;
```

```ts [bot.ts]
import { commandDev } from "./commands/admin.ts";
import { commandUser } from "./commands/users/grup.ts";
import type { MyContext } from "./types.ts";

export const bot = new Bot<MyContext>("TokenBot");

bot.use(commands());

bot.use(commandDev);
bot.use(commandUser);
```

```ts [admin.ts]
import { commandUser } from './users/grup.ts'
import type { MyContext } from '../types.ts'

export const commandDev = new CommandGroup<MyContext>()

commandDev.command('dev_login', 'Ucapkan salam', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply('Halo, diriku sendiri!')
      await ctx.setMyCommands(commandUser, commandDev)
   } else {
     await next()
   }
})

commandDev.command('jumlah_user', 'Ucapkan salam', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply(
        `User aktif: ${/** Tulis alur kodemu di sini */}`
    )
   } else {
     await next()
   }
})

commandDev.command('dev_logout', 'Ucapkan salam', async (ctx, next) => {
    if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
       await ctx.reply('Sampai jumpa, diriku!')
       await ctx.setMyCommands(commandUser)
   } else {
     await next()
   }
 })
```

```ts [grup.ts]
import salamSambutan from "./salam-sambutan.ts";
import salamPerpisahan from "./salam-perpisahan.ts";
import dsb from "./command-lainnya.ts";
import type { MyContext } from "../../types.ts";

export const userCommands = new CommandGroup<MyContext>()
  .add([salamSambutan, salamPerpisahan]);
```

```ts [salamSambutan.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("halo", "Ucapkan salam", async (ctx) => {
  await ctx.reply("Halo, user keren!");
});
```

:::

Dari kode di atas, apakah kamu menyadari selain melalui method `.command(...)`,
kita juga bisa menambahkan instansiasi `Commands` ke dalam `CommandGroup`
menggunakan method `.add`? Dengan begitu, baik struktur satu-file-tunggal,
seperti yang telah kita terapkan di file `admin.ts`, maupun struktur file
terdistribusi, seperti di file `group.ts`, keduanya bisa diterapkan dengan baik.

::: tip Selalu Gunakan Pengelompokan Perintah Ketika membuat dan meng-export
perintah menggunakan constructor `Command`, ia tidak bisa melakukan apa-apa
hingga ia didaftarkan ke penangan terkait. Oleh karena itu, pastikan untuk
mendaftarkannya ke pengelompokan perintah `CommandGroup` melalui method `.add`.
:::

Plugin ini juga mengharuskan kamu untuk menggunakan type `Context` yang sama
untuk `CommandGroup` dan `Commands` terkait agar kamu terhindar dari
kesalahan-kesalahan remeh yang mungkin ditimbulkan.

Dengan menggabungan pengetahuan di bagian ini dan bagian selanjutnya, kamu akan
lebih jago untuk mengotak-atik perintah sesuai keinginan.

## Lingkup Perintah

Tahukah kamu bahwa kita bisa menampilkan command yang berbeda berdasarkan tipe
obrolan, bahasa, atau bahkan status user di suatu grup? Itulah yang Telegram
sebut sebagai
[**Command Scopes**](https://core.telegram.org/bots/features#command-scopes)
atau lingkup perintah.

Oke, lingkup perintah merupakan fitur yang keren. Akan tetapi, menggunakannya
secara manual dapat menimbulkan masalah baru karena untuk memantau semua lingkup
serta perintah yang menyertainya bukanlah perkara mudah. Selain itu, dengan
menggunakan lingkup perintah secara langsung, kamu perlu melakukan filter secara
manual di setiap perintah untuk memastikan mereka dijalankan hanya untuk lingkup
tertentu saja. Menyinkronkan kedua hal tersebut akan sangat merepotkan, itulah
kenapa plugin ini dibuat. Mari kita lihat bagaimana prosesnya.

Class `Command` yang dikembalikan oleh method `command` mengekspos sebuah method
bernama `addToScope`. Method tersebut menerima sebuah
[BotCommandScope](/ref/types/botcommandscope) serta satu atau lebih penangan
lainnya. Penangan tersebut kemudian akan didaftarkan dan dijalankan untuk
lingkup-lingkup yang telah ditentukan.

Kamu bahkan tidak perlu memikirkan `filter`, karena method `addToScope` akan
memastikan penangan kamu dipanggil hanya jika context-nya sesuai.

Berikut contoh penggunaan lingkup perintah:

```ts
const myCommands = new CommandGroup();

myCommands
  .command("start", "Mulai konfigurasi bot")
  .addToScope(
    { type: "all_private_chats" },
    (ctx) => ctx.reply(`Halo, ${ctx.chat.first_name}!`),
  )
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply(`Halo, anggota ${ctx.chat.title}!`),
  );
```

Perintah `start` sekarang bisa dipanggil baik dari obrolan privat maupun grup.
Responnya pun akan berbeda berdasarkan sumber obrolannya. Selain itu, jika kamu
memanggil `myCommands.setCommands`, perintah `start` akan ditambahkan baik untuk
obrolan privat maupun grup.

Berikut contoh sebuah perintah yang hanya bisa diakses melalui grup admin.

```js
adminCommands
  .command("rahasia", "Khusus admin")
  .addToScope(
    { type: "all_chat_administrators" },
    (ctx) => ctx.reply("Ayam geprek gratis!"),
  );
```

Contoh yang ini untuk perintah yang hanya bisa diakses melalui grup.

```js
myCommands
  .command("lucu", "Ketawa")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply("Wkwk"),
  );
```

Dari contoh di atas, ketika kamu memanggil method `command`, ia menerima sebuah
perintah. Selain perintah, jika kamu memberinya sebuah penangan, penangan
tersebut akan diterapkan untuk lingkup `default` atau bawaan. Pemanggilan
`addToScope` untuk command tersebut akan menambah sebuah penangan baru untuk
lingkup yang telah ditentukan. Coba lihat contoh berikut:

```ts
myCommands
  .command(
    "default",
    "Perintah Bawaan",
    // Berikut akan dipanggil ketika berasal selain dari obrolan grup.
    (ctx) => ctx.reply("Halo! Respon ini berasal dari lingkup bawaan."),
  )
  .addToScope(
    { type: "all_group_chats" },
    // Berikut akan dipanggil untuk anggota grup yang bukan admin.
    (ctx) => ctx.reply("Halo, grup!"),
  )
  .addToScope(
    { type: "all_chat_administrators" },
    // Berikut akan dipanggil khusus untuk admin grup yang bersangkutan.
    (ctx) => ctx.reply("Halo, admin!"),
  );
```

## Terjemahan Perintah

Fitur keren lainnya adalah kita bisa mengatur beberapa nama dan deskripsi yang
berbeda untuk satu perintah yang sama berdasarkan bahasa yang digunakan oleh
user. Plugin commands menyediakan method `localize` yang bisa kamu gunakan untuk
melakukan pekerjaan tersebut dengan mudah. Coba lihat contoh berikut:

```js
myCommands
  // Kamu diharuskan membuat satu nama bawaan beserta deskripsinya.
  .command("hello", "Say hello")
  // Setelah itu, kamu bisa membuat versi terjemahannya.
  .localize("id", "halo", "Bilang Halo");
```

Kamu bisa menambahkan beberapa terjemahan sebanyak yang kamu mau! Plugin akan
mendaftarkan semua terjemahan tersebut ketika `myCommands.setCommands`
dipanggil.

Untuk mempermudah pekerjaan, grammY menyediakan sebuah object enum
`LanguageCodes` yang bisa kamu gunakan seperti pada contoh berikut:

::: code-group

```ts [TypeScript]
import { LanguageCodes } from "grammy/types";

myCommands.command(
  "chef",
  "Fried chicken delivery",
  (ctx) => ctx.reply("Fried chicken on the plate!"),
)
  .localize(
    LanguageCodes.Indonesian,
    "Sajikan ayam goreng",
    "Ayam goreng siap disajikan!",
  );
```

```js [JavaScript]
const { LanguageCodes } = require("grammy/types");

myCommands.command(
  "chef",
  "Fried chicken delivery",
  (ctx) => ctx.reply("Fried chicken on the plate!"),
)
  .localize(
    LanguageCodes.Indonesian,
    "Sajikan ayam goreng",
    "Ayam goreng siap disajikan!",
  );
```

```ts [Deno]
import { LanguageCodes } from "https://deno.land/x/grammy/types.ts";

myCommands.command(
  "chef",
  "Fried chicken delivery",
  (ctx) => ctx.reply("Fried chicken on the plate!"),
)
  .localize(
    LanguageCodes.Indonesian,
    "Sajikan ayam goreng",
    "Ayam goreng siap disajikan!",
  );
```

:::

### Melokalkan Perintah Menggunakan Plugin Internasionalisasi

Jika kamu mencari cara untuk melokalkan nama beserta deskripsi untuk file
`.ftl`, kamu bisa menerapkan konsep berikut:

```ts
function addLocalizations(command: Command) {
  i18n.locales.forEach((locale) => {
    command.localize(
      locale,
      i18n.t(locale, `${command.name}.command`),
      i18n.t(locale, `${command.name}.description`),
    );
  });
  return command;
}

myCommands.commands.forEach(addLocalizations);
```

## Menemukan Perintah yang Paling Mirip

Meski Telegram menyediakan fitur lengkapi-otomatis (auto-complete) untuk
perintah-perintah yang terdaftar, namun user terkadang mengetiknya secara
manual, yang mana kesalahan ketik sangat mungkin terjadi. Plugin ini dapat
membantumu mengatasi skenario tersebut dengan cara menyediakan saran perintah
yang mungkin dimaksud oleh user. Fitur tersebut juga kompatibel dengan awalan
tersuai. Jadi, kamu tidak perlu khawatir akan hal tersebut. Cara penggunaanya
pun tidak rumit:

::: code-group

```ts [TypeScript]
// Gunakan flavor untuk membuat context tersuai.
type MyContext = Context & CommandsFlavor;

// Gunakan context yang telah dibuat untuk menginisiasi bot kamu.
const bot = new Bot<MyContext>("token");
const myCommands = new CommandGroup<MyContext>();

// ... Daftarkan perintah-perintahnya.

bot
  // Periksa apakah mengandung sebuah perintah.
  .filter(commandNotFound(myCommands))
  // Jika mengandung perintah, berarti ia tidak ditangani oleh penangan perintah sebelumnya.
  .use(async (ctx) => {
    if (ctx.commandSuggestion) {
      // Sarankan perintah yang mirip.
      await ctx.reply(
        `Maaf, saya tidak tahu perintah tersebut. Apakah maksud Anda ${ctx.commandSuggestion}?`,
      );
      return;
    }
    // Perintah yang mirip tidak ditemukan.
    await ctx.reply("Maaf, saya tidak tahu perintah tersebut.");
  });
```

```js [JavaScript]
const bot = new Bot("token");
const myCommands = new CommandGroup();

// ... Daftarkan perintah-perintahnya.

bot
  // Periksa apakah mengandung sebuah perintah.
  .filter(commandNotFound(myCommands))
  // Jika mengandung perintah, berarti ia tidak ditangani oleh penangan perintah sebelumnya.
  .use(async (ctx) => {
    if (ctx.commandSuggestion) {
      // Sarankan perintah yang mirip.
      await ctx.reply(
        `Maaf, saya tidak tahu perintah tersebut. Apakah maksud Anda ${ctx.commandSuggestion}?`,
      );
      return;
    }
    // Perintah yang mirip tidak ditemukan.
    await ctx.reply("Maaf, saya tidak tahu perintah tersebut.");
  });
```

:::

Di balik layar, `commandNotFound` menggunakan method context `getNearestCommand`
yang secara bawaan memprioritaskan perintah berdasarkan bahasa user. Jika kamu
tidak menghendakinya, atur nilai flag `ignoreLocalization` menjadi `true`.
Pencarian di beberapa instansiasi `CommandGroup` juga dimungkinkan karena
`ctx.commandSuggestion` juga akan mencari perintah yang paling mirip di semua
instansiasi tersebut. Selain itu, kamu bisa mengatur flag `ignoreCase` untuk
mengabaikan peka huruf kapital (case-sensitive) ketika mencari perintah yang
serupa, dan flag `similarityThreshold` untuk mengatur tingkat kemiripan suatu
perintah hingga layak dijadikan sebuah saran.

Function `commandNotFound` akan terpicu hanya untuk update yang mengandung teks
perintah yang mirip dengan perintah-perintah yang kamu telah kamu daftarkan.
Misalnya, jika kamu mendaftarkan
[perintah yang menggunakan awalan tersuai](#prefix) seperti `?`, ia akan memicu
penangan terkait untuk semua entitas yang mirip dengan perintah tersebut.
Sebagai contoh, teks `?halo` akan memicu penangan terkait, tapi tidak dengan
`/halo`. Hal yang sama juga berlaku sebaliknya, jika kamu memiliki perintah yang
menggunakan awalan bawaan, ia hanya akan terpicu untuk update seperti `/halo`,
`/mulai`, dsb.

Perintah yang disarankan berasal dari instansiasi `CommandGroup` yang kamu
terapkan ke function terkait saja. Artinya, pengecekan bisa dialihkan menjadi
beberapa filter terpisah.

Mari kita terapkan pengetahuan yang sudah kita dapat sejauh ini:

```ts
const myCommands = new CommandGroup();
myCommands.command("dad", "calls dad", () => {}, { prefix: "?" })
  // Indonesia
  .localize("id", "ayah", "panggil ayah")
  // Spanyol
  .localize("es", "papa", "llama a papa")
  // Perancis
  .localize("fr", "pere", "appelle papa");

const otherCommands = new CommandGroup();
otherCommands.command("bread", "eat a toast", () => {})
  // Indonesia
  .localize("id", "roti", "makan roti goreng")
  // Spanyol
  .localize("es", "pan", "come un pan")
  // Perancis
  .localize("fr", "pain", "manger du pain");

// Daftarkan grup perintah untuk setiap bahasa.

// Mari kita asumsikan user adalah orang Perancis dan mengetik /Papi.
bot
  // Filter ini akan terpicu untuk semua perintah, baik '/reguler' ataupun '?tersuai'.
  .filter(commandNotFound([myCommands, otherCommands], {
    ignoreLocalization: true,
    ignoreCase: true,
  }))
  .use(async (ctx) => {
    ctx.commandSuggestion === "?papa"; // Menghasilkan nilai true.
  });
```

Jika misalkan `ignoreLocalization` bernilai `false`, `ctx.commandSuggestion`
akan bernilai `/pain`. Kita bisa menambahkan lebih banyak filter dengan
parameter yang berbeda ataupun menggunakan `CommandGroups` untuk melakukan
pengecekan. Dan cara-cara lain yang bisa kita eksplorasi!

## Opsi Perintah

Instansiasi `CommandGroup` memiliki beberapa opsi yang bisa kita terapkan, baik
untuk setiap perintah, setiap lingkup, ataupun secara global. Opsi-opsi berikut
bisa kamu manfaatkan untuk mengatur perilaku bot dalam menangani perintah secara
fleksibel.

### `ignoreCase`

Secara bawaan, perintah akan dicocokkan dengan memperhatikan huruf kapital
(case-sensitive). Ketika flag ini diterapkan, semua huruf baik kapital maupun
tidak, akan dianggap sama. Perintah bernama `/budi` akan cocok dengan `/BUDI`,
`/budI`, atau variasi huruf kapital lainnya.

### `targetedCommands`

Ketika user memanggil sebuah perintah, mereka bisa menyebut bot kamu seperti
ini: `/perintah@username_bot`. Kamu bisa memutuskan apa yang bot harus lakukan
terhadap jenis perintah tersebut menggunakan opsi pengaturan `targetedCommands`.
Melalui opsi tersebut, kamu bisa memilih tiga perilaku yang berbeda:

- `ignored`: Abaikan perintah yang menyertakan username bot kamu.
- `optional`: Tangani kedua jenis perintah, baik yang menyertakan username bot
  kamu, maupun yang tidak.
- `required`: Hanya tangani perintah yang menyertakan username bot kamu.

### `prefix`

Ketika tulisan ini dibuat, Telegram hanya mengenali perintah yang dimulai dengan
awalan `/`, yang mana bisa ditangani dengan baik oleh
[library inti grammY](../guide/commands). Di beberapa skenario, kamu mungkin
ingin mengubah perilaku tersebut dan menggantinya dengan awalan tersuai. Kamu
bisa memanfaatkan opsi `prefix` supaya plugin mencari awalan yang dimaksud
ketika menganalisa sebuah perintah.

Jika kamu perlu mengambil entity `botCommand` dari suatu update untuk kemudian
dihidrasi menggunakan awalan tersuai yang telah didaftarkan, kamu bisa
menggunakan method bernama `ctx.getCommandEntities(perintahKamu)`. Ia
mengembalikan interface yang sama dengan `ctx.entities('bot_command')`.

:::tip Perintah dengan awalan tersuai tidak dapat ditampilkan di menu perintah
user. :::

### `matchOnlyAtStart`

Ketika [menangani perintah](../guide/commands), library inti grammY hanya akan
mengenali perintah yang terletak di awal kalimat. Berbeda dengan plugin
commands, Ia mampu menyimak perintah baik yang terletak di pertengahan, maupun
di akhir kalimat. Cukup atur nilai opsi `matchOnlyAtStart` menjadi `false` untuk
mengaktifkannya.

## Perintah RegExp

Fitur ini ditujukan untuk kamu yang suka petualangan. Kamu bisa menggunakan
regular expression (RegExp) alih-alih string statis. Berikut contoh
sederhananya:

```ts
myCommands
  .command(
    /hapus_([a-zA-Z]+)/,
    (ctx) => ctx.reply(`Menghapus ${ctx.msg?.text?.split("_")[1]}`),
  );
```

Penangan perintah di atas akan terpicu untuk `/hapus_kenangan`, ataupun
`/hapus_dosa`. Ia akan membalas pesan dengan "Menghapus kenangan" untuk contoh
pertama dan "Menghapus dosa" untuk contoh kedua. Tetapi, ia tidak akan terpicu
untuk perintah `/hapus_` ataupun `/hapus_123xyz`.

## Ringkasan Plugin

- Nama: `commands`
- [Sumber](https://github.com/grammyjs/commands)
- [Reference](/ref/commands/)
