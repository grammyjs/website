---
prev:
  link: ./reliability
next:
  link: ./transformers
---

# Peningkatan IV: Limitasi Flood

Berdasarkan [FAQ Bot](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this), Telegram melakukan pembatasan terhadap jumlah maksimal pesan yang boleh dikirim oleh sebuah bot per detiknya.
Oleh sebab itu, kamu harus memastikan bot kesayanganmu tidak terkena _rate limit_ karena melampaui limit tersebut.
Kalau masih bandel melanggar limit tersebut, bot kamu bisa-bisa di-banned oleh pihak Telegram.

## Solusi Paling Simpel

::: warning Bukan Solusi Sesungguhnya
Solusi berikut hanya akan menyelesaikan masalah untuk sementara waktu.
Jika kamu ingin solusi untuk jangka panjang, baca [bagian selanjutnya.](#solusi-sesungguhnya-direkomendasikan)
:::

Solusi paling simpel ketika request API gagal karena terkena rate limit adalah... tunggu hingga sisa waktu rate limit-nya habis lalu ulangi lagi request tersebut.

Kamu bisa melakukannya menggunakan [plugin `auto-retry` yang super duper simpel](../plugins/auto-retry).
Ia adalah sebuah [function transformer API](./transformers) yang berfungsi persis seperti namanya, coba-otomatis.

Sayangnya, jika trafik bot kamu semakin lama semakin tinggi, misal bot kamu dimasukkan ke grup besar yang sangat ramai chat-nya, bot-mu akan sering sekali terkena rate limit hingga lonjakan trafik tersebut mereda.
Kalau sudah begitu, siap-siap bot kamu kena surat tilang dari polisi Telegram, alias di-banned.

Tidak hanya itu, di sisi server juga akan terbebani oleh penggunaan RAM dan bandwith yang tidak perlu karena request dikirim beberapa kali secara terus menerus.
Kakek tua bijak pernah berkata, "Mencegah lebih baik daripada mengobati". Oleh karena itu, lebih baik semua request API kita kumpulkan terlebih dahulu lalu kirim secara bergantian dengan kecepatan maksimal yang diizinkan oleh Telegram, seperti solusi di bawah ini:

## Solusi Sesungguhnya (Direkomendasikan)

grammY menyediakan sebuah [plugin throttler](../plugins/transformer-throttler) yang berfungsi untuk membuat bot kamu mematuhi semua aturan rate limit dengan cara menampung semua request yang keluar ke dalam antrian pesan telebih dahulu.
Plugin ini selain mudah dipasang juga mampu melakukan kontrol flood yang lebih baik dibandingkan cara sebelumnya.
Sama sekali tidak ada alasan yang bagus untuk menggunakan [plugin auto-retry](../plugins/auto-retry) dibandingkan [plugin throttler](../plugins/transformer-throttler).
Dalam beberapa kasus, kombinasi keduanya juga bisa membantu.
