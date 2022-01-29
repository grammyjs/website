---
prev: ./
next: ./structuring.md
---

# Middleware Redux

[Qo'llanmada](./guide/middleware.md) biz middleware'ni funktsiyalar sifatida tanishtirdik.
Middlewareni ushbu chiziqli usulda (grammYda ham) ishlatishingiz mumkin.

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

Ko'rinishidan "stack"ga o'xshaydi, faqat sahna ortida, u haqiqatan ham daraxt simondir.
Ushbu funktsiyaning yuragi bu daraxtni yaratadigan `Composer` class'idir ([ma'lumotnoma](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer)).

Birinchidan, `Bot`ning har bir nusxasi `Composer`ning namunasidir.
Bu shunchaki kichik `class`, shuning uchun `Bot` `class`i `Composer`ni kengaytiradi.

Bundan tashqari, `Composer` ning har bir usuli ichki `use` ni chaqirishni yodda tutishingiz kerak.
Misol uchun, `filter` ba'zi bir tarmoqli vositachi dasturlari bilan `use`ni chaqiradi, `on` esa berilgan [filter so'rovi](./guide/filter-queries.md)ga nisbatan yangilanishlarga mos keladigan ba'zi bir predikat funksiyasi bilan `filter`ni yana chaqiradi.
Shuning uchun biz hozircha `use` ni ko'rib chiqish bilan cheklanishimiz kerak, qolganlari esa quyidagicha.

Endi biz `Composer` sizning `use` chaqirishlaringiz bilan nima qilishini va u erdagi boshqa middleware tizimlaridan qanday farq qilishini batafsil ko'rib chiqishimiz kerak.
Farqi uncha bilinmasligi mumkin, lekin nima uchun ajoyib natijalarga olib kelishini bilish uchun keyingi bo'limga qadar kuting.

## Kengaytirilgan `Composer`lar

Siz `Composer` ning o'zini biror joyga yozishingiz mumkin keyin ham `Composer` misolida ko'proq middlewareni yozishingiz mumkin.

```ts
const bot = new Bot("<token>"); // `Composer`ning kichik classi

const composer = new Composer();
bot.use(composer);

// Bular ishga tushadi:
composer.use(/* A */);
composer.use(/* B */);
composer.use(/* C */);
```

`A`, `B`, va `C` ishga tushadi.
All this says is that once you have installed an instance of `Composer`, you can still call `use` on it and this middleware will still be run.
Bularning barchasi shundan iboratki, siz `Composer` nusxasini yozganingizdan so'ng, siz hali ham `use` chaqirishingiz mumkin va bu middleware hali ham ishlaydi.
(Bu ajoyib narsa emas, lekin keyingi operatsiyalarni e'tiborsiz qoldiradigan ommaviy raqobatdosh misollar uchun asosiy farq.)

Siz bu erda daraxt tuzilishi qayerda ekanligiga hayron bo'lishingiz mumkin.
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
So'ng bu daraxt har bir yangilanish bilan birinchi navbatda chuqurlikdan o'tadi, shuning uchun siz boshqa tizimlardan bilganingiz kabi chiziqli tartibda `A` dan `L` gacha samarali tarzda o'tadi.

This is made possible by creating a new instance of `Composer` every time you call `use` that will in turn be extended (as explained above).
Bu har safar `use` chaqirganingizda `Composer` ning yangi nusxasini yaratish orqali mumkin bo'ladi, bu esa o'z navbatida kengaytiriladi (yuqorida tushuntirilganidek).

## `use` chaqiruvini birlashtirish

Agar biz faqat `use` so'zini ishlatgan bo'lsak, bu unchalik foydali bo'lmaydi (so'z o'yini nazarda tutilgan).
Bu masala qiziqroq bo'ladi. `filter` ishga tushadi.

Buni ko'rib chiqing:

```ts
const composer = new Composer();

composer.filter(/* 1 */, /* A */).use(/* B */)

composer.filter(/* 2 */).use(/* C */, /* D */)
```

3-qatorda biz `1` predikat funksiyasi orqasida `A` ni qayd qilamiz.
`A` faqat `1` shartidan o'tgan yangilanishlar uchun baholanadi.
Biroq, `filter` biz 3-qatordagi `use` chaqiruvi bilan kengaytiriladigan `Composer` misolini qaytaradi, shuning uchun `B` mutlaqo boshqa `use` chaqiruvida yozilgan bo'lsa ham, `1` bilan himoyalangan.

5-qator 3-qatorga teng, chunki `C` ham, `D` ham faqat `2` bajarilgan taqdirdagina ishga tushadi.

Filtr so'rovlarini AND bilan birlashtirish uchun `bot.on()` chaqirishni qanday zanjirlash mumkinligini eslaysizmi?
Tasavvur qiling:

```ts
const composer = new Composer();

composer.filter(/* 1 */).filter(/* 2 */).use(/* A */);
```

`2` faqat `1` bo'lsa, `A` esa faqat `2` (va shunday qilib `1`) bo`lsa, tekshiriladi.

Filtr so'rovlarini yangi bilimlaringiz bilan [birlashtirish](./guide/filter-queries.md#combining-multiple-queries) bo'limini qayta ko'rib chiqing va bilimignizni mustahkamlab oling.

Bu erda alohida holat `fork` hisoblanadi, chunki u bir vaqtning o'zida ikkita hisoblashni boshlaydi, ya'ni voqea siklida aralashtiriladi.
Asosiy `use` chaqiruvlari bilan yaratilgan `Composer` misolini qaytarish oʻrniga, u ajratilgan hisoblashni aks ettiruvchi `Composer`ni qaytaradi.
This allows for concise patterns like `bot.fork().on(':text').use(/* A */)`.
Bu `bot.fork().on(':text').use(/* A */)` kabi ixcham ko'rinishlarga ruxsat beradi.
`A` endi parallel hisoblash tarmog'ida bajariladi.
