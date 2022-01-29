---
prev: ./
next: ./structuring.md
---

# Middleware Redux

[Qo'llanmada](./guide/middleware.md) biz middleware'ni funksiyalar sifatida tanishtirdik.
Middlewelar ketma-ket ishlata olinishini (grammYda ham) hisobga olib, uni funksiyalar to'plami deb atash ham mumkin.

## grammY'da middleware

Odatda, quyidagi strukturani ko'rasiz.

```ts
const bot = new Bot("<token>");

bot.use(/* ... */);
bot.use(/* ... */);

bot.on(/* ... */);
bot.on(/* ... */);
bot.on(/* ... */);

bot.start();
```

Ko'rinishidan ketma-ketlikdagi to'plamga o'xshaydi, ammo sahna ortida u tarmoqlangan ko'rinishda bo'ladi.
Ushbu funksiyaning yuragi bu tarmoqlangan strukturani yaratadigan `Composer` class'idir ([ma'lumotnoma](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer)).

Birinchidan, `Bot`ning har bir nusxasi `Composer`ning namunasidir.
Demak kichik `class`, shuning uchun `Bot` `class`i `Composer`ni kengaytiradi.

Bundan tashqari, `Composer` ning har bir metodi aslida `use` ni chaqirishni yodda tutishingiz kerak.
Misol uchun, `filter` tarmoqlangan middlewarelar orqali `use`ni chaqiradi, `on` esa berilgan [filter so'rovi](./guide/filter-queries.md)ga nisbatan updatelarga mos keladigan ba'zi bir belgilangan funksiyasi bilan `filter`ni yana chaqiradi.
Shuning uchun biz hozircha `use` ni ko'rib chiqish bilan cheklanishimiz kerak.

Endi biz `Composer` sizning `use` chaqirishlaringiz bilan nima qilishini va u yerdagi boshqa middleware tizimlaridan qanday farq qilishini batafsil ko'rib chiqishimiz kerak.
Farqi uncha bilinmasligi mumkin, lekin qanday afzalliklari borligini bilish uchun keyingi bo'limga qadar kuting.

## Kengaytirilgan `Composer`lar

Siz `Composer`ning o'zini biror yerda ishlatganingizdan keyin ham `Compser` nusxasiga yana ko'proq middlewarelar o'rnatishingiz mumkin.

```ts
const bot = new Bot("<token>"); // `Composer`ning nusxasi

const composer = new Composer();
bot.use(composer);

// Bular ishga tushadi:
composer.use(/* A */);
composer.use(/* B */);
composer.use(/* C */);
```

`A`, `B`, va `C` ishga tushadi.
Bularning barchasi shundan iboratki, siz `Composer` nusxasini yozganingizdan keyin ham `use` chaqirishingiz mumkin va bu middleware hali ham ishlaydi.
(Bu ta'sirli narsa emas, lekin ketma-ket operatsiyalarni e'tiborsiz qoldiradigan ommaviy raqobatdosh frameworklar uchun asosiy farq.)

Siz bu erda tarmoqlangan tuzilishi qayerda ekanligiga hayron bo'lishingiz mumkin.
Keling, ushbu strukturani ko'rib chiqaylik:

```ts
const composer = new Composer();

composer.use(/* A */);
composer.use(/* B */).use(/* C */);
composer.use(/* D */).use(/* E */).use(/* F */).use(/* G */);
composer.use(/* H */).use(/* I */);
composer.use(/* J */).use(/* K */).use(/* L */);
```

Ko'ra oldingizmi?

Siz taxmin qilganingizdek, barcha middleware `A` dan `L` gacha bo'lgan tartibda ishga tushiriladi.

Boshqa kutubxonalar bu kodni ekvivalent qilish uchun tekislaydi `composer.use(/* A */).use(/* B */).use(/* C */).use(/* D */) ...` va boshqalar.
Aksincha, grammY siz ko‘rsatgan daraxtni saqlaydi: bitta ildiz tugunida (`composer`) beshta bola (`A`, `B`, `D`, `H`, `J`), bola esa `B` yana bitta bolasi bor, `C` va hokazo.
So'ng bu tarmoq har bir update bilan ildizdan boshlab o'tib chiqiladi, bundan kelib chiqadiki siz boshqa tizimlardan bilganingiz kabi ketma-ket tartibda `A` dan `L` gacha samarali tarzda o'tadi.

Bu har safar `use` chaqirganingizda `Composer` ning yangi nusxasini yaratish orqali amalga oshiriladi, bu esa o'z navbatida kengaytiriladi (yuqorida tushuntirilganidek).

## `use` chaqiruvlarini birlashtirish

Agar biz faqat `use` so'zini ishlatgan bo'lsak, bu unchalik foydali bo'lmaydi.
Bu jarayon `filter` qo'shilganida yanada qiziqarli bo'ladi.

Buni ko'rib chiqing:

```ts
const composer = new Composer();

composer.filter(/* 1 */, /* A */).use(/* B */)

composer.filter(/* 2 */).use(/* C */, /* D */)
```

3-qatorda biz `1` belgilangan funksiyasidan keyin `A` ni qayd qilamiz.
`A` faqat `1` shartidan o'tgan updatelar uchun ishlaydi.
Biroq, `filter` biz 3-qatordagi `use` chaqiruvi bilan kengaytiriladigan `Composer` nusxasini qaytaradi, shuning uchun `B` mutlaqo boshqa `use` chaqiruvida yozilgan bo'lsa ham, `1` sharti bilan himoyalangan.

5-qator 3-qatorga teng, chunki `C` ham, `D` ham faqat `2` bajarilgan taqdirdagina ishga tushadi.

Filtr so'rovlarini AND bilan birlashtirish uchun `bot.on()` chaqirishni qanday zanjirlash mumkinligi esingizdami?
Tasavvur qiling:

```ts
const composer = new Composer();

composer.filter(/* 1 */).filter(/* 2 */).use(/* A */);
```

`2` faqat `1` sharti bajarilsa, `A` esa faqat `2` (va albatta `1`) sharti bajarilsa.

Yangi olgan bilimlaringiz bilan filtr so'rovlarini [birlashtirish](./guide/filter-queries.md#combining-multiple-queries) bo'limini qayta ko'rib chiqing va bilimignizni mustahkamlab oling.

Bu yerda alohida holat `fork` hisoblanadi, chunki u bir vaqtning o'zida ikkita jarayonni boshlaydi, ya'ni event loopga qo'shiladi.
Asosiy `use` chaqiruvlari bilan yaratilgan `Composer` nusxasini qaytarish oʻrniga, u ajratilgan jarayonni aks ettiruvchi `Composer`ni qaytaradi.
Bu `bot.fork().on(':text').use(/* A */)` kabi ixcham ko'rinishga keltirish imkonini beradi.
`A` endi parallel tarmoqda bajariladi.
