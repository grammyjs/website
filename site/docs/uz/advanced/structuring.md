---
prev: ./middleware.md
next: ./scaling.md
---

# Kengaytirish I: Katta kod bazasi

Sizning botingiz murakkablashib borishi bilan siz dastur kodlari bazasini qanday tuzish masalasiga duch kelasiz.
Tabiiyki, siz uni fayllarga bo'lishingiz mumkin.

## Yechim

> grammY hali juda yosh va hali DI konteynerlari bilan rasmiy integratsiyani ta'minlamaydi.
> Biz buni qo'llab-quvvatlasak, xabardor bo'lish uchun [@grammyjs_news](https://t.me/grammyjs_news) ga obuna bo'ling.

Siz o'zingizning kodingizni xohlaganingizcha tuzishingiz mumkin va barchaga mos keladigan yagona yechim yo'q.
Aytish joizki, kodingizni tuzishning sodda va tasdiqlangan strategiyasi quyidagilardir.

1. Semantik jihatdan bir xil faylda (yoki kod hajmiga, jildga qarab) bir-biriga tegishli narsalarni birlashtiring.
   Ushbu qismlarning har biri belgilangan xabarlarni boshqaradigan middlewareni ko'rsatadi.
2. Botni yozish orqali barcha middlewareni birlashtiradigan bot misolini yozing.
3. (Ixtiyoriy.) Yangilanishlarni markaziy tarzda oldindan filtrlang va yangilanishlarni faqat toʻgʻri yoʻl bilan yuboring.
   Buning uchun `bot.route` ([API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Composer#route)) yoki muqobil ravishda [router plugini](./plugins/router.md)dan foydalanishingiz mumkin.

Yuqoridagi strategiyani amalga oshiradigan ishga tushiriladigan misolni [Example Bot repository](https://github.com/grammyjs/examples/tree/main/scaling)sida topishingiz mumkin.

## Struktura misoli

TODO ro'yxatini boshqaradigan oddiy bot uchun siz ushbu strukturani ko'rishingiz mumkin.

```asciiart:no-line-numbers
src/
├── bot.ts
└── todo/
    ├── item.ts
    └── list.ts
```

`item.ts` shunchaki TODO elementlari haqidagi ba'zi narsalarni belgilaydi va bu kod qismlari `list.ts` da qo'llaniladi.

`list.ts` da ushbu misolni yozishingiz mumkin qilasiz:

```ts
export const lists = new Composer();

// Middlewareni odatdagidek boshqaradigan ba'zi handlerlarni bu erda ro'yxatdan o'tkazing.
lists.on('message', ctx => { ... });
```

Ixtiyoriy, siz modul ichida bo'lgan barcha xatolarni boshqarish uchun "[error boundary](./guide/errors.md#error-boundaries)"dan foydalanishingiz mumkin.

Endi `bot.ts` da ushbu modulni quyidagi tarzda yozishingiz mumkin:

```ts
import { lists } from "./todo/list";

const bot = new Bot("<token>");

bot.use(lists);
// ... bu yerda `todo` kabi modullar ko'proq bo'lishi mumkin

bot.start();
```

Optionally, you can use the [router plugin](./plugins/router.md) or to bundle up the different modules, if you're able to determine which middleware is responsible upfront.

Biroq, esda tutingki, botingizni qanday tuzishning aniq usulini umumiy tarzda tushuntirish mushkulroq.
Har doimgidek, dasturiy ta'minotda, buni eng mantiqiy tarzda bajaring :wink:
