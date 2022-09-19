# Internacionalización con Fluent (`fluent`)

![Oficial](/badges/official-es.svg) ![Node.js](/badges/nodejs.svg)

[Fluent](https://projectfluent.org/) es un sistema de localización creado por la Fundación Mozilla para realizar traducciones naturales.
Tiene una sintaxis muy potente y elegante que permite a cualquiera escribir traducciones eficientes y totalmente comprensibles.
Este plugin aprovecha este increíble sistema de localización para hacer que los bots alimentados por grammY sean fluidos con traducciones de alta calidad.

::: tip No se debe confundir
No confundas esto con [i18n](./i18n.md).

[i18n](./i18n.md) es una versión mejorada de este plugin que funciona tanto en Deno como en Node.js.
:::

## Inicializar Fluent

Lo primero que hay que hacer es inicializar una instancia de Fluent:

```typescript
import { Fluent } from "@moebius/fluent";

const fluent = new Fluent();
```

A continuación, tendrá que añadir al menos una traducción a la instancia de Fluent:

```typescript
await fluent.addTranslation({
  // Especifica una o más localizaciones soportadas por tu traducción:
  locales: "es",

  // Puede especificar el contenido de la traducción directamente:
  source: "{SU CONTENIDO DE ARCHIVO DE TRADUCCIÓN}",

  // O los archivos de traducción:
  filePath: [
    `${__dirname}/feature-1/translation.en.ftl`,
    `${__dirname}/feature-2/translation.en.ftl`,
  ],

  // Todos los aspectos de Fluent son altamente configurables:
  bundleOptions: {
    // Utilice esta opción para evitar los caracteres invisibles alrededor de los elementos colocables.
    useIsolating: false,
  },
});
```

## Escribir mensajes de traducción

La sintaxis de Fluent debería ser fácil de dominar.
Puedes empezar mirando los [ejemplos oficiales](https://projectfluent.org/#examples) o estudiando la [guía completa de sintaxis](https://projectfluent.org/fluent/guide/).

Empecemos con este ejemplo por ahora:

```ftl
-bot-name = Apples Bot

welcome =
  Welcome, {$name}, to the {-bot-name}!
  You have { NUMBER($applesCount) ->
    [0] no apples
    [one] {$applesCount} apple
    *[other] {$applesCount} apples
  }.
```

Demuestra tres características importantes de Fluent, a saber: **términos**, **sustitución de variables** (también conocidos como _placeables_) y **pluralización**.

El `welcome` es el **identificador del mensaje**, que se utilizará para referenciar su mensaje siempre que se renderice.

La sentencia `-bot-name = Apples Bot` define un **término** con nombre `bot-name` y valor `Apples Bot`.
La construcción `{-bot-name}` hace referencia al término previamente definido y será reemplazado por el valor del término cuando se renderice.

La declaración `{$name}` será reemplazada por el valor de la variable `name` que tendrá que pasar a la función de traducción usted mismo.

Y la última sentencia (_líneas 5 a 9_) define un **selector** (muy similar a una sentencia switch) que toma el resultado de la función especial `NUMBER` aplicada a la variable `applesCount` y selecciona uno de los tres posibles mensajes a renderizar basándose en el valor coincidente.
La función `NUMBER` devolverá una [categoría plural CLDR](https://www.unicode.org/cldr/cldr-aux/charts/30/supplemental/language_plural_rules.md) basada en el valor proporcionado y la configuración regional utilizada.
Esto implementa efectivamente la pluralización.

## grammY Configuración

Ahora vamos a ver cómo este mensaje de arriba podría ser renderizado por un bot.
Pero primero, necesitaremos configurar grammY para usar el plugin.

Antes que nada, necesitarás configurar tu bot para que utilice el sabor de contexto Fluent.
Si no estás familiarizado con este concepto, deberías leer los documentos oficiales sobre [Context Flavors](../guide/context.md#context-flavors).

```typescript
import { Context } from "grammy";
import { FluentContextFlavor } from "@grammyjs/fluent";

// Extiende el context type de tu aplicación con la interfaz flavor proporcionada.
export type MyAppContext = Context & FluentContextFlavor;
```

Tendrás que crear tu instancia de bot de la siguiente manera para poder utilizar el tipo de contexto aumentado:

```typescript
const bot = new Bot<MyAppContext>();
```

Y el último paso sería registrar el propio plugin de Fluent con grammY:

```typescript
bot.use(
  useFluent({
    fluent,
  }),
);
```

Asegúrate de pasar la [instancia de Fluent previamente creada](#inicializar-fluent).

## Renderizar los mensajes localizados

Genial, ¡ya tenemos todo listo para renderizar nuestros mensajes!
Vamos a hacerlo definiendo un comando de prueba en nuestro bot:

```typescript
bot.command("i18n_test", async (ctx) => {
  // Llama al helper "translate" o "t" para renderizar el
  // mensaje especificando su ID y parámetros adicionales:
  await ctx.reply(
    ctx.t("welcome", {
      name: ctx.from.first_name,
      applesCount: 1,
    }),
  );
});
```

Ahora puedes iniciar tu bot y utilizar el comando `/i18n_test`.
Debería mostrar el siguiente mensaje:

```text:no-line-numbers
¡Bienvenido, Slava, al Bot de las Manzanas!
Tienes 1 manzana.
```

Por supuesto, verás tu propio nombre en lugar de "Slava".
Prueba a cambiar el valor de la variable `applesCount` para ver cómo cambia el mensaje renderizado.

Ten en cuenta que ahora puedes utilizar la función de traducción en todos los lugares donde el `Contexto` esté disponible.
La librería determinará automáticamente la mejor localización posible para cada usuario que interactúe con tu bot, basándose en sus preferencias personales (el idioma establecido en la configuración del cliente de Telegram).
Sólo tendrás que crear varios archivos de traducción y asegurarte de que todas las traducciones están correctamente sincronizadas.

## Otros pasos

- Completa la lectura de la [documentación de Fluent](https://projectfluent.org/), especialmente la [guía de sintaxis](https://projectfluent.org/fluent/guide/).
- [Migrar desde el plugin `i18n`](https://github.com/grammyjs/fluent#i18n-plugin-replacement)
- Familiarícese con [`@moebius/fluent`](https://github.com/the-moebius/fluent#readme).

## Resumen del plugin

- Nombre: `fluent`
- Fuente: <https://github.com/grammyjs/fluent>
