---
prev: ./transformers.md
next: ./deployment.md
---

# Dukungan Proxy

Di grammY, kamu bisa mengatur bagaimana network request dilakukan.
Termasuk menambahkan payload khusus ke setiap request yang akan digunakan untuk pemasangan proxy agent.
Lihat `ApiClientOptions` di [Referensi API grammY](https://deno.land/x/grammy/mod.ts?s=ApiClientOptions).

Berikut cara menggunakan proxy `http` di Deno:

```ts
import { Bot } from "https://deno.land/x/grammy/mod.ts";

const client = Deno.createHttpClient({
  proxy: { url: "http://host:port/" },
});
const bot = new Bot(TOKEN, { // <-- put your bot token between the ""
  client: {
    baseFetchConfig: {
      // @ts-ignore
      client,
    },
  },
});
```

> Ingat! Gunakan flag `--unstable` supaya script di atas bisa berjalan.

Berikut cara menggunakan proxy dengan package `socks5-https-client` ([npm](https://www.npmjs.com/package/socks-proxy-agent)) di Node.js:

```ts
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent({
  host: host, // Masukkan host proxy
  port: port, // Masukkan port proxy
});

const bot = new Bot("", {
  client: {
    baseFetchConfig: {
      agent: socksAgent,
      compress: true,
    },
  },
});
```

> Perlu diketahui bahwa menambahkan `compress: true` merupakan pilihan opsional untuk optimisasi performa.
> Opsi tersebut tidak ada kaitannya dengan proxy.
> Ia adalah salah satu bagian dari value bawaan untuk `baseFetchConfig`, jadi jika kamu tetap menginginkannya, kamu harus menetapkan opsi tersebut lagi.

Membuat sebuah proxy supaya bisa berjalan dengan baik bukanlah pekerjaan yang mudah.
Hubungi kami di [chat Telegram](https://t.me/grammyjs) kalau kamu mengalami kendala atau jika kamu ingin grammY untuk menambahkan opsi-opsi konfigurasi proxy lainnya.
Kami juga punya [chat Telegram Rusia](https://t.me/grammyjs_ru).
