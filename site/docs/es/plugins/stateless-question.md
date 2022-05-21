# Pregunta sin estado (`stateless-question`)

> Crear preguntas sin estado a los usuarios de Telegram que trabajan en modo de privacidad

¿Quieres mantener la privacidad del usuario con [el modo de privacidad de Telegram activado (por defecto)](https://core.telegram.org/bots#privacy-mode), enviar a los usuarios preguntas traducidas en su idioma y no guardar el estado que los usuarios están haciendo actualmente?

Este plugin quiere resolver este problema.

La idea básica es enviar su pregunta con un [texto especial](https://en.wikipedia.org/wiki/Zero-width_non-joiner) al final.
Este texto es invisible para el usuario pero visible para tu bot.
Cuando el usuario responde a un mensaje se comprueba el mensaje.
Si contiene este texto especial al final es una respuesta a la pregunta.
De esta manera puedes tener muchas cadenas para las mismas preguntas como cuando tienes traducciones.
Sólo tienes que asegurarte de que el `uniqueIdentifier` es único dentro de tu bot.

## Uso

```ts
import {StatelessQuestion} from '@grammyjs/stateless-question';

const bot = new Bot(token);

const unicornQuestion = new StatelessQuestion('unicornio', ctx => {
    console.log('El usuario cree que los unicornios están haciendo:', ctx.message)
})

// No te olvides de utilizar el middleware.
bot.use(unicornQuestion.middleware())

bot.command('arcoiris', async ctx => {
    let text
    if (ctx.session.language === 'de') {
        text = 'Was machen Einhörner?'
    } else {
        text = '¿Qué hacen los unicornios?'
    }

    return unicornQuestion.replyWithMarkdown(ctx, text)
})

// O envíe su pregunta manualmente (¡asegúrese de utilizar parse_mode y force_reply!).
bot.command('unicornio', async ctx => ctx.replyWithMarkdown('¿Qué hacen los unicornios?' + unicornQuestion.messageSuffixMarkdown(), {parse_mode: 'Markdown', reply_markup: {force_reply: true}})
bot.command('unicornio', async ctx => ctx.replyWithHTML('¿Qué hacen los unicornios?' + unicornQuestion.messageSuffixHTML(), {parse_mode: 'HTML', reply_markup: {force_reply: true}})
```

Consulte el [plugin README](https://github.com/grammyjs/stateless-question) para obtener más información.

## Resumen del plugin

- Name: `stateless-question`
- Source: <https://github.com/grammyjs/stateless-question>
