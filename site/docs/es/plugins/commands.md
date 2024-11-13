---
prev: false
next: false
---

# Comandos (`commands`)

Manejo de comandos con esteroides.

Este plugin proporciona varias características relacionadas con el manejo de comandos que no están contenidas en [el manejo de comandos realizado por la librería central](../guide/commands).
He aquí un rápido resumen de lo que obtienes con este plugin:

- Mejor legibilidad del código encapsulando el middleware con definiciones de comandos
- Sincronización del menú de comandos de usuario mediante `setMyCommands`.
- Mejor agrupación y organización de comandos
- Posibilidad de ampliar el alcance de los comandos, por ejemplo: sólo accesibles para administradores de grupo o
  canales, etc.
- Definición de traducciones de comandos
- Función «¿Quería decir...?», que encuentra el comando existente más cercano a una determinada
  error de entrada del usuario
- Coincidencia de comandos sin distinción entre mayúsculas y minúsculas
- Establecimiento de un comportamiento personalizado para los comandos que mencionan explícitamente al usuario de tu bot,
  como: `/start@your_bot`.
- Prefijos de comando personalizados, por ejemplo: `+`, `?` o cualquier símbolo en lugar de `/`.
- Soporte para comandos que no están al principio del mensaje
- Comandos RegExp

Todas estas características son posibles porque definirás una o más estructuras de comandos centrales que definan los comandos de tu bot.

## Uso básico

Antes de entrar en materia, echa un vistazo a cómo puedes registrar y manejar un comando con el plugin:

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Di hola", (ctx) => ctx.reply(`¡Hola, mundo!`));

bot.use(myCommands);
```

Esto registra un nuevo comando `/start` a tu bot que será manejado por el middleware dado.

Ahora, vamos a entrar en algunas de las herramientas adicionales que este plugin tiene para ofrecer.

## Importación

En primer lugar, así es como puedes importar todos los tipos y clases necesarios que proporciona el plugin.

::: code-group

```ts [TypeScript]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "@grammyjs/commands";
```

```js [JavaScript]
const { CommandGroup, commands, commandNotFound } = require(
  "@grammyjs/commands",
);
```

```ts [Deno]
import {
  CommandGroup,
  commandNotFound,
  commands,
  type CommandsFlavor,
} from "https://deno.land/x/grammy_commands/mod.ts";
```

:::

Ahora que las importaciones están asentadas, veamos cómo podemos hacer que nuestros comandos sean visibles para nuestros usuarios.

## Configuración del menú de comandos de usuario

Una vez que hayas definido tus comandos con una instancia de la clase `CommandGroup`, puedes llamar al método `setCommands`, que registrará todos los comandos definidos en tu bot.

```ts
const myCommands = new CommandGroup();

myCommands.command("hello", "Di hola", (ctx) => ctx.reply("¡Hola!"));
myCommands.command(
  "start",
  "Iniciar el bot",
  (ctx) => ctx.reply("Empezando..."),
);

bot.use(myCommands);

await myCommands.setCommands(bot);
```

Esto hará que todos los comandos que registres se muestren en el menú de un chat privado con tu bot, o siempre que los usuarios escriban `/` en un chat del que tu bot sea miembro.

### Acceso directo contextual

¿Qué pasa si quieres que algunos comandos sólo se muestren a determinados usuarios? Por ejemplo, imagina que tienes un comando `login` y otro `logout`.
El comando `login` sólo debería aparecer para los usuarios que han cerrado sesión, y viceversa.
Así es como puedes hacerlo con el plugin de comandos:

::: code-group

```ts [TypeScript]
// Utilice el flavor para crear un contexto personalizado
type MyContext = Context & CommandsFlavor;

// Utiliza el nuevo contexto para instanciar tu bot
const bot = new Bot<MyContext>("token");

// Registrar el acceso directo de contexto
bot.use(commands());

const loggedOutCommands = new CommandGroup();
const loggedInCommands = new CommandGroup();

loggedOutCommands.command(
  "login",
  "Inicie su sesión con el bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("¡Bienvenidos! ¡Sesión iniciada!");
  },
);

loggedInCommands.command(
  "logout",
  "Termina tu sesión con el bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Hasta luego :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// Por defecto, los usuarios no están logueados,
// por lo que puedes establecer los comandos de desconexión para todos
await loggedOutCommands.setCommands(bot);
```

```js [JavaScript]
// Registrar el acceso directo de contexto
bot.use(commands());

const loggedOutCommands = new CommandGroup();
const loggedInCommands = new CommandGroup();

loggedOutCommands.command(
  "login",
  "Inicie su sesión con el bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedInCommands);
    await ctx.reply("¡Bienvenidos! ¡Sesión iniciada!");
  },
);

loggedInCommands.command(
  "logout",
  "Termina tu sesión con el bot",
  async (ctx) => {
    await ctx.setMyCommands(loggedOutCommands);
    await ctx.reply("Hasta luego :)");
  },
);

bot.use(loggedInCommands);
bot.use(loggedOutCommands);

// Por defecto, los usuarios no están logueados,
// por lo que puedes establecer los comandos de desconexión para todos
await loggedOutCommands.setCommands(bot);
```

:::

De esta forma, cuando un usuario llame a `/login`, su lista de comandos cambiará para contener sólo el comando `logout`.
Genial, ¿verdad?

::: danger Restricciones en los Nombres de Comandos
Como se indica en la [Telegram Bot API documentation](https://core.telegram.org/bots/api#botcommand), los nombres de comando sólo pueden estar formados por:

> 1-32 caracteres.
> Sólo puede contener letras minúsculas inglesas, dígitos y guiones bajos.

Por lo tanto, llamar a `setCommands` o `setMyCommands` con algo que no sea lower_c4s3_commands lanzará una excepción.
Los comandos que no sigan estas reglas aún podrán ser registrados, utilizados y manejados, pero nunca se mostrarán en el menú de usuario como tales.
:::

**Ten en cuenta** que `setCommands` y `setMyCommands` sólo afectan a los comandos mostrados en el menú de comandos del usuario, y no al acceso real a los mismos.
Aprenderás cómo implementar el acceso restringido a comandos en la sección [Comandos restringidos](#comandos-de-ambito).

### Agrupando comandos

Dado que podemos dividir y agrupar nuestros comandos en diferentes instancias, permite una organización de archivos de comandos mucho más idiomática.

Digamos que queremos tener comandos sólo para desarrolladores.
Podemos lograrlo con la siguiente estructura de código:

```ascii
src/
├─ commands/
│  ├─ admin.ts
│  ├─ users/
│  │  ├─ group.ts
│  │  ├─ say-hi.ts
│  │  ├─ say-bye.ts
│  │  ├─ ...
├─ bot.ts
├─ types.ts
tsconfig.json
```

El siguiente grupo de código ejemplifica cómo podríamos implementar un grupo de comandos sólo para desarrolladores, y actualizar el menú de comandos del cliente de Telegram en consecuencia.
Asegúrate de fijarte en los diferentes patrones utilizados en los archivos `admin.ts` y `group.ts`.

::: code-group

```ts [types.ts]
export type MyContext = Context & CommandsFlavor<MyContext>;
```

```ts [bot.ts]
import { devCommands } from "./commands/admin.ts";
import { userCommands } from "./commands/users/group.ts";
import type { MyContext } from "./types.ts";

export const bot = new Bot<MyContext>("MyBotToken");

bot.use(commands());

bot.use(userCommands);
bot.use(devCommands);
```

```ts [admin.ts]
import { userCommands } from './users/group.ts'
import type { MyContext } from '../types.ts'

export const devCommands = new CommandGroup<MyContext>()

devCommands.command('devlogin', 'Saludos', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply('Hola a mí')
      await ctx.setMyCommands(userCommands, devCommands)
   } else {
     await next()
   }
})

devCommands.command('usercount', 'Saludos', async (ctx, next) => {
   if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
      await ctx.reply(
        `Usuarios activos: ${/** Your business logic */}`
    )
   } else {
     await next()
   }
})

devCommands.command('devlogout', 'Saludos', async (ctx, next) => {
    if (ctx.from?.id === ctx.env.DEVELOPER_ID) {
       await ctx.reply('Adiós')
       await ctx.setMyCommands(userCommands)
   } else {
     await next()
   }
 })
```

```ts [group.ts]
import sayHi from "./say-hi.ts";
import sayBye from "./say-bye.ts";
import etc from "./another-command.ts";
import type { MyContext } from "../../types.ts";

export const userCommands = new CommandGroup<MyContext>()
  .add([sayHi, sayBye]);
```

```ts [say-hi.ts]
import type { MyContext } from "../../types.ts";

export default new Command<MyContext>("sayhi", "Saludos", async (ctx) => {
  await ctx.reply("¡Hola pequeño usuario!");
});
```

:::

¿Te has dado cuenta de que es posible registrar comandos individuales inicializados a través del método `.add` en la instancia `CommandGroup` o también directamente a través del método `.command(...)`?
Esto permite una estructura de un solo archivo, como en el archivo `admin.ts`, o una estructura de archivos más distribuida como en el archivo `group.ts`.

::: tip Utiliza siempre grupos de comandos
Al crear y exportar comandos utilizando el constructor `Command`, es obligatorio registrarlos en una instancia `CommandGroup` mediante el método `.add`.
Por sí solos son inútiles, así que asegúrate de hacerlo en algún momento.
:::

El plugin también te obliga a tener el mismo tipo de Contexto para un determinado `CommandGroup` y sus respectivos `Commands` ¡así evitarás a primera vista ese tipo de errores tontos!

Combinando este conocimiento con la siguiente sección llevarás tu juego de comandos al siguiente nivel.

## Comandos de ámbito

¿Sabías que puedes permitir que se muestren diferentes comandos en diferentes chats dependiendo del tipo de chat, el idioma, e incluso el estado del usuario en un grupo de chat? Eso es lo que Telegram llama [**Ámbitos de Comandos**](https://core.telegram.org/bots/features#command-scopes).

Ahora, los Ámbitos de Comandos son una característica genial, pero usarlos a mano puede ser realmente complicado, ya que es difícil hacer un seguimiento de todos los ámbitos y qué comandos presentan.
Además, al usar los Ámbitos de Comandos por sí solos, tienes que hacer un filtrado manual dentro de cada comando para asegurarte de que sólo se ejecutarán para los ámbitos correctos.
Sincronizar esas dos cosas puede ser una pesadilla, y por eso existe este plugin.
Comprueba cómo se hace.

La clase `Command` devuelta por el método `command` expone un método llamado `addToScope`.
Este método toma un [BotCommandScope](/ref/types/botcommandscope) junto con uno o más handlers, y registra esos handlers para ser ejecutados en ese scope específico.

Ni siquiera tienes que preocuparte de llamar a `filter`, el método `addToScope` garantizará que tu handler sólo sea llamado si el contexto es el correcto.

Este es un ejemplo de un comando con ámbito:

```ts
const myCommands = new CommandGroup();

myCommands
  .command("start", "Inicializa la configuración del bot")
  .addToScope(
    { type: "all_private_chats" },
    (ctx) => ctx.reply(`Hola, ${ctx.chat.first_name}!`),
  )
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply(`Hola, miembros de ${ctx.chat.title}!`),
  );
```

El comando `start` ahora puede ser llamado tanto desde chats privados como de grupo, y dará una respuesta diferente dependiendo desde donde sea llamado.
Ahora, si llamas a `myCommands.setCommands`, el comando `start` se registrará tanto en los chats privados como en los de grupo.

Aquí tienes un ejemplo de un comando al que sólo pueden acceder los administradores de grupo.

```js
adminCommands
  .command("secret", "Sólo para administradores")
  .addToScope(
    { type: "all_chat_administrators" },
    (ctx) => ctx.reply("¡Pastel gratis!"),
  );
```

Y aquí hay un ejemplo de un comando que sólo es accesible en grupos

```js
myCommands
  .command("fun", "Risa")
  .addToScope(
    { type: "all_group_chats" },
    (ctx) => ctx.reply("Jaja"),
  );
```

Observa que cuando llamas al método `command`, se abre un nuevo comando.
Si le das un manejador, ese manejador se aplicará al ámbito `default` de ese comando.
Al llamar a `addToScope` en ese comando se añadirá un nuevo manejador, que se filtrará a ese ámbito.
Echa un vistazo a este ejemplo.

```ts
myCommands
  .command(
    "default",
    "Default command",
    // Se ejecutará cuando no se esté en un chat de grupo o cuando el usuario no sea un administrador.
    (ctx) => ctx.reply("Hello from default scope"),
  )
  .addToScope(
    { type: "all_group_chats" },
    // Esto sólo se llamará para los usuarios no administradores de un grupo
    (ctx) => ctx.reply("Hello, group chat!"),
  )
  .addToScope(
    { type: "all_chat_administrators" },
    // Esto será llamado para los administradores de grupo, cuando estén dentro de ese grupo
    (ctx) => ctx.reply("Hello, admin!"),
  );
```

## Traducciones de comandos

Otra potente característica es la capacidad de establecer diferentes nombres para el mismo comando, y sus respectivas descripciones basadas en el idioma del usuario.
El plugin de comandos lo hace fácil proporcionando el método `localize`.
Compruébalo:

```js
myCommands
  // Debe establecer un nombre y una descripción por defecto
  .command("hello", "Di hola")
  // Y luego puede establecer los localizados
  .localize("pt", "ola", "Dizer olá");
```

¡Añade tantos como quieras! El plugin se encargará de registrarlos por ti cuando llames a `myCommands.setCommands`.

Por conveniencia, grammY exporta un objeto tipo enum `LanguageCodes` que puedes usar para una aproximación más idiomática:

::: code-group

```ts [TypeScript]
import { LanguageCodes } from "grammy/types";

myCommands.command(
  "chef",
  "Entrega de filetes",
  (ctx) => ctx.reply("¡Filete al plato!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Filete a domicilio",
  );
```

```js [JavaScript]
const { LanguageCodes } = require("grammy/types");

myCommands.command(
  "chef",
  "Entrega de filetes",
  (ctx) => ctx.reply("¡Filete al plato!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Filete a domicilio",
  );
```

```ts [Deno]
import { LanguageCodes } from "https://deno.land/x/grammy/types.ts";

myCommands.command(
  "chef",
  "Entrega de filetes",
  (ctx) => ctx.reply("¡Filete al plato!"),
)
  .localize(
    LanguageCodes.Spanish,
    "cocinero",
    "Filete a domicilioo",
  );
```

:::

### Localización de comandos con el plugin de internacionalización

Si desea que los nombres y descripciones de los comandos localizados se agrupen dentro de los archivos `.ftl`, puede utilizar la siguiente idea:

```ts
function addLocalizations(command: Command) {
  i18n.locales.forEach((locale) => {
    command.localize(
      locale,
      i18n.t(locale, `${command.name}.command`),
      i18n.t(locale, `${command.name}.description`),
    );
  });
  return command;
}

myCommands.commands.forEach(addLocalizations);
```

## Encontrar el comando más cercano

Aunque Telegram es capaz de autocompletar los comandos registrados, a veces los usuarios los escriben manualmente y, en algunos casos, cometen errores.
El plugin de comandos te ayuda a lidiar con eso permitiéndote sugerir un comando que podría ser lo que el usuario quería en primer lugar.
Es compatible con prefijos personalizados, así que no tienes que preocuparte por eso, y su uso es bastante sencillo:

::: code-group

```ts [TypeScript]
// Utilice el flavor para crear un contexto personalizado
type MyContext = Context & CommandsFlavor;

// Utiliza el nuevo contexto para instanciar tu bot
const bot = new Bot<MyContext>("token");
const myCommands = new CommandGroup<MyContext>();

// ... Registre los comandos

bot
  // Comprobar si existe un comando
  .filter(commandNotFound(myCommands))
  // Si es así, significa que no fue manejado por ninguno de nuestros comandos.
  .use(async (ctx) => {
    // Encontramos una coincidencia potencial
    if (ctx.commandSuggestion) {
      await ctx.reply(
        `Hmm... No conozco ese comando. ¿Te refieres a ${ctx.commandSuggestion}?`,
      );
    }

    // Nada parece acercarse a lo que el usuario escribió
    await ctx.reply("Uy... No conozco ese comando :/");
  });
```

```js [JavaScript]
// Utiliza el nuevo contexto para instanciar tu bot
const bot = new Bot("token");
const myCommands = new CommandGroup();

// ... Registre los comandos

bot
  // Comprobar si existe un comando
  .filter(commandNotFound(myCommands))
  // Si es así, significa que no fue manejado por ninguno de nuestros comandos.
  .use(async (ctx) => {
    // Encontramos una coincidencia potencial
    if (ctx.commandSuggestion) {
      await ctx.reply(
        `Hmm... No conozco ese comando. ¿Te refieres a ${ctx.commandSuggestion}?`,
      );
    }

    // Nada parece acercarse a lo que el usuario escribió
    await ctx.reply("Uy... No conozco ese comando :/");
  });
```

:::

Entre bastidores, `commandNotFound` utilizará el método contextual `getNearestCommand` que, por defecto, dará prioridad a los comandos que correspondan al idioma del usuario.
Si no se desea este comportamiento, se puede pasar el parámetro `ignoreLocalization` a true.
Es posible buscar entre múltiples instancias de CommandGroup, y `ctx.commandSuggestion` será el comando más similar, si lo hay, entre todos ellos.
También permite establecer la bandera `ignoreCase`, que ignorará las mayúsculas y minúsculas mientras se busca un comando similar y la bandera `similarityThreshold`, que controla lo similar que tiene que ser el nombre de un comando a la entrada del usuario para que sea recomendado.

La función `commandNotFound` sólo se activará para actualizaciones que contengan texto similar a comandos registrados.
Por ejemplo, si sólo ha registrado [comandos con un prefijo personalizado](#prefix) como `?`, se activará el controlador para cualquier cosa que se parezca a sus comandos, por ejemplo: `?sayhi` pero no `/definitely_a_command`.
Lo mismo ocurre a la inversa, si sólo tienes comandos con el prefijo por defecto, sólo se activará en las actualizaciones que se parezcan a `/regular` `/commands`.

Los comandos recomendados sólo provendrán de las instancias de `CommandGroup` que pases a la función. Así que podrías diferir las comprobaciones en múltiples filtros separados.

Utilicemos los conocimientos anteriores para inspeccionar el siguiente ejemplo:

```ts
const myCommands = new CommandGroup();
myCommands.command("dad", "calls dad", () => {}, { prefix: "?" })
  .localize("es", "papa", "llama a papa")
  .localize("fr", "pere", "appelle papa");

const otherCommands = new CommandGroup();
otherCommands.command("bread", "eat a toast", () => {})
  .localize("es", "pan", "come un pan")
  .localize("fr", "pain", "manger du pain");

// Registrar cada grupo de comandos específico del idioma

// Supongamos que el usuario es francés y ha escrito /Papi
bot
  // este filtro se activará para cualquier comando como '/regular' o '?custom'
  .filter(commandNotFound([myCommands, otherCommands], {
    ignoreLocalization: true,
    ignoreCase: true,
  }))
  .use(async (ctx) => {
    ctx.commandSuggestion === "?papa"; // se evalúa como verdadero
  });
```

Si el `ignoreLocalization` fuera falso habríamos obtenido «`ctx.commandSuggestion` igual a `/pain`».
Podríamos añadir más filtros como el anterior, con diferentes parámetros o `CommandGroups` para comprobar.
Hay muchas posibilidades.

## Opciones de comandos

Hay algunas opciones que se pueden especificar por comando, por ámbito, o globalmente para una instancia `CommandGroup`.
Estas opciones te permiten personalizar aún más cómo tu bot maneja los comandos, dándote más flexibilidad.

### `ignoreCase`

Por defecto, los comandos harán coincidir la entrada del usuario distinguiendo entre mayúsculas y minúsculas.
Si se activa esta opción, por ejemplo, en un comando llamado `/dandy`, coincidirá con `/DANDY` del mismo modo que con `/dandY` o cualquier otra variación que distinga entre mayúsculas y minúsculas.

### `targetedCommands`

Cuando los usuarios invocan un comando, pueden etiquetar opcionalmente su bot, de la siguiente manera: `/comando@nombre_usuario_bot`. Puedes decidir qué hacer con estos comandos utilizando la opción de configuración `targetedCommands`.
Con ella puedes elegir entre tres comportamientos diferentes:

- `ignored`: Ignora los comandos que mencionan al usuario de tu bot.
- `optional`: Maneja tanto los comandos que mencionan como los que no mencionan al usuario del bot
- `required`: Sólo maneja comandos que mencionan el usuario del bot

### `prefix`

Actualmente, sólo los comandos que empiezan por `/` son reconocidos por Telegram y, por tanto, por el [manejo de comandos realizado por la librería central de grammY](../guide/commands).
En algunas ocasiones, puede que quieras cambiar eso y usar un prefijo personalizado para tu bot.
Esto es posible gracias a la opción `prefix`, que le dirá al plugin de comandos que busque ese prefijo cuando intente identificar un comando.

Si alguna vez necesitas recuperar entidades `botCommand` de una actualización y necesitas que se hidraten con el prefijo personalizado que has registrado, existe un método específicamente adaptado para ello, llamado `ctx.getCommandEntities(yourCommands)`, que devuelve la misma interfaz que `ctx.entities('bot_command')`.

::: tip
Los comandos con prefijos personalizados no pueden mostrarse en el Menú Comandos.
:::

### `matchOnlyAtStart`

Cuando [maneja comandos](../guide/commands), la biblioteca central de grammY sólo reconocerá comandos que empiecen en el primer carácter de un mensaje.
El plugin de comandos, sin embargo, te permite escuchar comandos en medio del texto del mensaje, o al final, ¡no importa!
Todo lo que tienes que hacer es establecer la opción `matchOnlyAtStart` a `false`, y el resto lo hará el plugin.

## Comandos RegExp

Esta característica es para aquellos que realmente buscan ir salvaje, que le permite crear manejadores de comandos basados en expresiones regulares en lugar de cadenas estáticas, un ejemplo básico se vería así:

```ts
myCommands
  .command(
    /delete_([a-zA-Z]+)/,
    (ctx) => ctx.reply(`Deleting ${ctx.msg?.text?.split("_")[1]}`),
  );
```

Este gestor de órdenes se disparará en `/delete_me` igual que en `/delete_you`, y responderá «Borrarme» en el primer caso y «Borrarte» en el segundo, pero no se disparará en `/delete_` ni en `/delete_123xyz`, pasando como si no estuviera.

## Plugin Summary

- Name: `commands`
- [Source](https://github.com/grammyjs/commands)
- [Reference](/ref/commands/)
