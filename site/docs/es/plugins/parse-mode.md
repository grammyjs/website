---
prev: false
next: false
---

# Complemento del modo de análisis sintáctico (`parse-mode`)

Telegram admite [mensajes con estilo](https://core.telegram.org/bots/api#messageentity).
Esta biblioteca aporta utilidades de formato simplificadas a grammY.
Te permite redactar mensajes con formato enriquecido utilizando una API declarativa y segura.

En la API de Telegram Bot, el texto con formato se representa mediante _entidades_, marcadores especiales que definen qué partes del texto deben formatearse de manera específica.
Cada entidad tiene un _tipo_ (por ejemplo, `negrita`, `cursiva`, etc.), un _desplazamiento_ (donde comienza en el texto) y una _longitud_ (a cuántos caracteres afecta).

Trabajar directamente con estas entidades puede resultar engorroso, ya que es necesario realizar un seguimiento manual de los desplazamientos y las longitudes.
El complemento Parse Mode resuelve este problema proporcionando una API sencilla y declarativa para formatear texto.

## Dos enfoques: `fmt` y `FormattedString`

Esta biblioteca ofrece dos enfoques principales para el formato de texto:

1. **`fmt` Función de plantilla etiquetada**:
   Una [etiqueta literal de plantilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) que le permite escribir texto formateado de forma natural utilizando expresiones de plantilla.
   Gestiona internamente los desplazamientos y las longitudes de las entidades por usted.

2. **Clase `FormattedString`**:
   Un enfoque basado en clases que permite crear texto formateado mediante el encadenamiento de métodos.
   Esto resulta especialmente útil para construir mensajes formateados complejos mediante programación.

Ambos enfoques producen un objeto `FormattedString` unificado que se puede utilizar para manipular texto formateado.

## Uso (utilizando `fmt`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { b, fmt, u } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Usando los valores de retorno de fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { fmt, b, u } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Usando los valores de retorno de fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { b, fmt, u } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Usando los valores de retorno de fmt
  const combined = fmt`${b}bolded${b} ${ctx.msg.text} ${u}underlined${u}`;
  await ctx.reply(combined.text, { entities: combined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    { caption: combined.caption, caption_entities: combined.caption_entities },
  );
});

bot.start();
```

:::

## Uso (utilizando `FormattedString`)

::: code-group

```ts [TypeScript]
import { Bot } from "grammy";
import { FormattedString } from "@grammyjs/parse-mode";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Método estático
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `)
    .u("underlined");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // O constructor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(
    ` ${ctx.msg.text} `,
  ).u("underlined");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

```js [JavaScript]
const { Bot } = require("grammy");
const { FormattedString } = require("@grammyjs/parse-mode");

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Método estático
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `)
    .u("underlined");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // O constructor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(
    ` ${ctx.msg.text} `,
  ).u("underlined");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

```ts [Deno]
import { Bot } from "https://deno.land/x/grammy/mod.ts";
import { FormattedString } from "https://deno.land/x/grammy_parse_mode/mod.ts";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  // Método estático
  const staticCombined = FormattedString.b("bolded").plain(` ${ctx.msg.text} `)
    .u("underlined");
  await ctx.reply(staticCombined.text, { entities: staticCombined.entities });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: staticCombined.caption,
      caption_entities: staticCombined.caption_entities,
    },
  );

  // O constructor
  const constructorCombined = (new FormattedString("")).b("bolded").plain(
    ` ${ctx.msg.text} `,
  ).u("underlined");
  await ctx.reply(constructorCombined.text, {
    entities: constructorCombined.entities,
  });
  await ctx.replyWithPhoto(
    "https://raw.githubusercontent.com/grammyjs/website/main/logos/grammY.png",
    {
      caption: constructorCombined.caption,
      caption_entities: constructorCombined.caption_entities,
    },
  );
});

bot.start();
```

:::

## Conceptos fundamentales

### `FormattedString` como tipo de retorno unificado

La clase `FormattedString` es un componente central del complemento `parse-mode`, que proporciona una interfaz unificada para trabajar con texto formateado.
El valor de retorno de `fmt`, `new FormattedString` y `FormattedString.<staticMethod>` devuelve una instancia de `FormattedString`.
Esto significa que se pueden combinar diferentes estilos de uso.

Por ejemplo, es posible utilizar `fmt`, seguido de métodos de instancia encadenables de `FormattedString`, y luego pasar el resultado a otra plantilla etiquetada como `fmt`.

```ts
bot.on("msg:text", async ctx => {
  // El resultado de fmt`${${u}¡Memoria actualizada!${u}}` es un FormattedString
  // cuya llamada al método de instancia `.plain(«\n»)` también devuelve un FormattedString.
  const header = fmt`${${u}¡Memoria actualizada!${u}}`.plain("\n");
  const body = FormattedString.plain("¡Lo recordaré!");
  const footer = "\n - por Grammy AI";

  // Esto también es válido: puedes pasar FormattedString y string a `fmt`.
  const response = fmt`${header}${body}${footer}`;
  await ctx.reply(response.text, { entities: response.entities });
});
```

### Cosas que acepta `fmt`

La plantilla etiquetada como `fmt` acepta una amplia variedad de valores para construir tu `FormattedString`, incluyendo:

- `TextWithEntities` (implementado por `FormattedString` y mensajes de texto normales de Telegram)
- `CaptionWithEntities` (implementado por `FormattedString` y mensajes multimedia normales de Telegram con subtítulos)
- EntityTag (como tus funciones `b()` y `a(url)`)
- Funciones nulas que devuelven un EntityTag (como `b` e `i`)
- Cualquier tipo que implemente `toString()` (se tratará como valor de texto sin formato)

### `TextWithEntities`

La interfaz `TextWithEntities` representa texto con entidades de formato opcionales.

```ts
interface TextWithEntities {
  text: string;
  entities?: MessageEntity[];
}
```

Tenga en cuenta que la forma de este tipo implica que los mensajes de texto normales de Telegram también implementan `TextWithEntities` de forma implícita.
Esto significa que, de hecho, es posible hacer lo siguiente:

```ts
bot.on("msg:text", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold(
    "Esta es mi respuesta",
  );
  await ctx.reply(response.text, { entities: response.entities });
});
```

### `CaptionWithEntities`

La interfaz `CaptionWithEntities` representa un título con entidades de formato opcionales.

```ts
interface CaptionWithEntities {
  caption: string;
  caption_entities?: MessageEntity[];
}
```

Del mismo modo, ten en cuenta que la forma de este tipo implica que los mensajes multimedia normales con subtítulos de Telegram también implementan `CaptionWithEntities` de forma implícita.
Esto significa que, de hecho, también es posible hacer lo siguiente:

```ts
bot.on("msg:caption", async (ctx) => {
  const response = fmt`${ctx.msg}`.plain("\n---\n").bold(
    "Esta es mi respuesta",
  );
  await ctx.reply(response.text, { entities: response.entities });
});
```

## Resumen del complemento

- Nombre: `parse-mode`
- [Fuente](https://github.com/grammyjs/parse-mode)
- [Referencia](/ref/parse-mode/)
