# Daftar Periksa Deployment

Berikut hal-hal yang perlu diperhatikan ketika meng-hosting bot dengan skala yang besar.

> Kamu mungkin juga tertarik dengan panduan kami mengenai hosting sebuah bot.
> Lihat tab **Hosting / Tutorial** di bagian atas halaman untuk melihat beberapa platform yang sudah memiliki panduan khusus.

## Error

1. [Pasang `error handler` menggunakan `bot.catch` (long polling) atau pada web framework-mu (webhooks).](../guide/errors)
2. Gunakan `await` di semua `promise` dan install **linting** yang mewajibkan penerapan aturan tersebut agar kamu tidak lupa untuk menggunakan dua syntax ini.

## Pengiriman Pesan

1. Kirim file mengunakan `path` atau `buffer`, bukan dengan `stream`, atau setidaknya kamu [tahu jebakan-jebakannya](./transformers#penggunaan-function-transformer).
2. Gunakan `bot.on("callback_query:data")` sebagai penanganan _fallback_ untuk [menanggapi semua callback query](../plugins/keyboard#merespon-ketika-tombol-ditekan).
3. Gunakan [plugin `auto-retry`](../plugins/auto-retry) untuk menangani _flood wait_ (durasi tunggu karena terlalu banyak mengirim request ke Telegram) secara otomatis.

## Penskalaan

Ini tergantung dari jenis deployment kamu.

### Long Polling

1. [Gunakan grammY runner](../plugins/runner).
2. [Gunakan `sequentialize` dengan _session key_ dari _resolver function_ yang sama sebagai _session middleware_ kamu](./scaling#concurrency-itu-sulit).
3. Periksa konfigurasi `run` ([Referensi API](https://deno.land/x/grammy_runner/mod.ts?s=run)) dan pastikan sesuai dengan kebutuhanmu, atau bahkan pertimbangkan untuk membuat runner-mu sendiri dari [source](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSource) dan [sink](https://deno.land/x/grammy_runner/mod.ts?s=UpdateSink).
   Hal utama yang perlu dipertimbangkan adalah beban maksimum yang ingin diterapkan ke servermu, misal: berapa banyak update yang dapat diproses secara bersamaan.
4. Implementasikan [graceful shutdown](./reliability#graceful-shutdown) ketika hendak menghentikan bot (misalnya untuk beralih ke versi baru).

### Webhooks

1. Pastikan tidak melakukan operasi yang berjalan lama di middleware, seperti pengiriman file dalam jumlah besar.
   [Hal ini akan mengakibatkan error timeout](../guide/deployment-types#mengakhiri-request-webhook-tepat-waktu) pada webhooks serta pemrosesan update yang sama berulang kali karena Telegram terus mengirim kembali update yang tidak direspon.
   Untuk menghindari hal tersebut, sebaiknya gunakan sistem _task queuing_.
2. Buat dirimu terbiasa dengan konfigurasi `webhookCallback` ([Referensi API](https://deno.land/x/grammy/mod.ts?s=webhookCallback)).
3. Jika hendak mengatur opsi `getSessionKey` untuk session, [Gunakan `sequentialize` dengan _session key_ dari _resolver function_ yang sama sebagai _session middleware_ kamu.](./scaling#concurrency-itu-sulit).
4. Jika menjalankan bot di platform serverless atau autoscaling, [atur informasi bot](https://deno.land/x/grammy/mod.ts?s=BotConfig) untuk mencegah panggilan `getMe` yang berlebihan.
5. Pertimbangkan untuk menggunakan [webhook reply](../guide/deployment-types#webhook-reply).

## Session

1. Pertimbangkan menggunakan `lazySessions` seperti yang sudah dijelaskan [di sini](../plugins/session#lazy-sessions).
2. Gunakan opsi `storage` untuk mengatur tempat penyimpanan. Jika tidak dilakukan, semua data akan hilang ketika bot berhenti bekerja.

## Pengujian

Lakukan berbagai pengujian untuk bot.
Berikut cara melakukannya dengan grammY:

1. _Mock_ request API yang keluar menggunakan [function transformer](./transformers).
2. Tentukan dan kirim berbagai sampel object update ke bot melalui `bot.handleUpdate` ([referensi API](https://deno.land/x/grammy/mod.ts?s=Bot#method_handleUpdate_0)).
   Pertimbangkan untuk mengambil beberapa inspirasi dari [object update](https://core.telegram.org/bots/webhooks#testing-your-bot-with-updates) yang telah disediakan oleh tim Telegram.

::: tip Berkontribusi untuk Pengujian Framework
Meskipun grammY sudah menyediakan sarana yang diperlukan untuk membuat pengujian, tetapi akan sangat membantu jika kita memiliki framework pengujian tersendiri untuk berbagai bot.
Ini adalah wilayah baru, framework pengujian secara masal seperti itu belum pernah ada.
Kami menantikan kontribusimu!

Salah satu contoh bagaimana pengujian dilakukan [bisa ditemukan di sini](https://github.com/PavelPolyakov/grammy-with-tests).
:::
