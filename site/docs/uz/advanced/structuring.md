---
prev: ./middleware.md
next: ./scaling.md
---

# Kengaytirish I: Katta kod bazasi

Sizning botingiz murakkablashib borishi bilan siz dastur kodlari strukturasini qanday tuzish masalasiga duch kelasiz.
Tabiiyki, siz uni turli fayllarga ajratishingiz mumkin.

## Yechim

> grammY hali juda yosh va hali DI konteynerlari bilan rasmiy integratsiyani ta'minlamaydi.
> Biz integratsiyani amalga oshirganimizda xabardor bo'lish uchun [@grammyjs_news](https://t.me/grammyjs_news) ga obuna bo'ling.

Siz o'zingizning kodingizni xohlaganingizcha tuzishingiz mumkin va barchaga mos keladigan yagona yechim yo'q.
Aytish joizki, kodingizni tuzishning sodda va tasdiqlangan strategiyasi quyidagilardir.

1. Semantik jihatdan yoki kod hajmiga, jildga qarab) bir-biriga mos keladigan narsalarni bir faylda birlashtiring.
   Ushbu qismlarning har biri belgilangan xabarlarni boshqaradigan middlewareni ko'rsatadi.
2. Botga o'rnatish orqali barcha middlewareni birlashtiradigan bot nusxasini yarating.
3. (Ixtiyoriy.) Updatelarni markaziy tarzda oldindan filtrlang va updatelarni faqat toʻgʻri yoʻl bilan yuboring.
   Buning uchun `bot.route` ([API Ma'lumotnomasi](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer#route)) yoki muqobil ravishda [router plugini](./plugins/router.md)dan foydalanishingiz mumkin.

Yuqoridagi strategiyani qo'llagan holda ishlaydigan misolni [Example Bot repository](https://github.com/grammyjs/examples/tree/main/scaling)sida topishingiz mumkin.

## Struktura misoli

TODO ro'yxatini boshqaradigan sodda bot uchun siz ushbu strukturani tasavvur qilishingiz mumkin.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` shunchaki TODO elementlari haqidagi ba'zi narsalarni belgilaydi va bu kod qismlari `list.ts` da qo'llaniladi.

`list.ts` da esa quyidagi kabi yozishingiz mumkin:

```ts
export const lists = new Composer();

// Odatdagi kabi ba'zi bir xabar boshqaruvi middlewarelarini yozing.
lists.on('message', ctx => { ... });
```

Ixtiyoriy ravishda siz modul ichida kelib chiqadigan barcha xatolarni boshqarish uchun "[error boundary](./guide/errors.md#error-boundaries)"dan foydalanishingiz mumkin.

Endi `bot.ts` da quyidagi tarzda yozishingiz mumkin:

```ts
import { lists } from "./todo/list";

const bot = new Bot("<token>");

bot.use(lists);
// ... bu yerda `todo` kabi ko'proq modullar bo'lishi mumkin

bot.start();
```

Ixtiyoriy ravishda siz turli xil modullarni bir joyga to'plash uchun [router plugin](./plugins/router.md)ni ishlatishingiz mumkin.

Biroq, esda tutingki, botingizni qanday tuzishning aniq usulini umumiy tarzda tushuntirish ancha mushkulroq.
Har doimgidek, buni eng mantiqli tarzda bajarishingiz kerak :wink:
