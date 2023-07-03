---
prev: false
---

# Gambaran Umum Topik Tingkat Lanjut

Ketika bot menjadi semakin populer, kamu mungkin mengalami masalah yang semakin kompleks untuk membuat bot tetap berjalan dengan baik.

Di bab ini, kita akan mulai dengan menyelam lebih dalam ke [sistem middleware grammY](./middleware), yang akan memungkinkan kamu untuk menangani pesan yang lebih canggih lagi.

Empat materi selanjutnya akan membahas mengenai peningkatan skalabilitas.
Baca [Peningkatan I](./structuring) jika kode pemrograman menjadi semakin kompleks.
Baca [Peningkatan II](./scaling) jika harus memproses banyak pesan.
Baca [Peningkatan III](./reliability) jika khawatir dengan keandalan bot.
Baca [Peningkatan IV](./flood) jika bot mencapai rate limit, misalnya selalu mendapatkan error 429.

Kalau kamu perlu mencegat dan mengubah request API sebelum diproses lebih lanjut, grammY menyarankan kamu untuk memasang [function transformer](./transformers).

Selain itu, grammY juga memiliki [dukungan proxy](./proxy).

Terakhir, kami menyusun [daftar beberapa hal yang harus diingat](./deployment) saat meluncurkan bot.
Tidak ada yang baru di sana, hanya pengingat mengenai potensi-potensi terjadinya kesalahan atau jebakan, semuanya ada di satu tempat untuk kamu pelajari.
Bisa jadi itu dapat membuat tidur malam harimu lebih nyenyak, bukan.
