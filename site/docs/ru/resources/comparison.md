---
next: false
---

# Как grammY конкурирует с другими фреймворками

Хотя grammY использует некоторые концепции, известные из других библиотек для разработки ботов (и библиотек для веба), он был написан с нуля для оптимальной читабельности и производительности.

> Пожалуйста, примите во внимание, что это сравнение необъективно, хотя мы и пытаемся предоставить вам объективное описание преимуществ и недостатков использования grammY по сравнению с другими библиотеками.
> Мы стараемся поддерживать актуальность этой статьи.
> Если вы заметили, что что-то устарело то пожалуйста, отредактируйте эту страницу, используя ссылку внизу.

## Сравнение с другими фреймворками на JavaScript

::: tip Сначала выберите язык программирования
Учитывая, что вы читаете документацию по фреймворку в экосистеме JavaScript то вы, скорее всего, ищете что-то для работы на Node.js, Deno или Bun.
Однако если это не так, [прокрутите страницу вниз](#сравнение-с-фреимворками-на-других-языках-программирования), чтобы узнать, какие языки программирования подходят для разработки ботов.
Естественно, вы также найдете краткое сравнение с фреймворками других языков (в основном Python).
:::

Есть два основных проекта, из которых grammY черпает вдохновение, а именно [Telegraf](https://github.com/telegraf/telegraf) и [NTBA](https://github.com/yagop/node-telegram-bot-api).
Пока что мы сосредоточимся на них, но в будущем мы (или вы?) можем добавить другие сравнения.

### Telegraf

grammY берет свое начало в Telegraf, поэтому здесь мы кратко расскажем о том, как эти библиотеки связаны между собой исторически.

Когда создавался grammY, Telegraf был замечательной библиотекой, и без неё grammY не стал бы самим собой.
Однако раньше Telegraf был написан на JavaScript (в версии 3).
Редкие объявления типов добавлялись вручную и плохо поддерживались, поэтому они были неполными, неправильными и устаревшими.
Строгое объявление типов --- важнейший аспект любой серьезной библиотеки, поскольку они обеспечивают инструментальную поддержку и позволяют значительно быстрее итерировать код.
Многие люди предпочитают иметь безопасность типов при разработке сложных ботов, а для некоторых отказ от неё является критическим.

В Telegraf v4 была предпринята попытка исправить это, переписав весь код на язык TypeScript.
К сожалению, многие из получившихся типов оказались настолько сложными (но правильными), что их было трудно понять.
Более того, миграция выявила в коде бесчисленные странности ([пример](https://github.com/telegraf/telegraf/issues/1076)), из-за которых было сложно найти правильные типы даже для существующего кода.

В результате, несмотря на то, что версия 4.0 _пыталась_ улучшить корректность и инструментальную поддержку, в итоге она сделала Telegraf существенно _труднее в использовании_, чем его нетипизированный предшественник.
Понятно, что многие уже существующие пользователи Telegraf v3 не захотели переходить на новую версию.
Новым пользователям также стало сложнее начать работу.

**grammY делает шаг назад и переосмысливает всю ситуацию со строгой типизацией, создавая фреймворк и ориентируясь на удобство использования.**
Это позволило пропустить множество разочаровывающих дискуссий о том, как справиться со странными внутренними типизациями.
Это позволило проекту получить чистый, последовательный, компилируемый код, который предоставляет пользователям отличные типы (что означает, поддержку IDE).
Безопасность типов, в свою очередь, позволяет использовать более продвинутые возможности, которые в корне меняют наше представление о разработке ботов, такие как [трансформация API методов](../advanced/transformers).

Несмотря на то, что Telegraf v3 до сих пор используется многими активными ботами --- библиотека сильно устарела.
Кроме того, экосистема плагинов Telegraf перешла на Telegraf v4 (по крайней мере, те, которые не были перенесены на grammY).

В данном сравнении grammY сравнивается только с Telegraf v4.

Вот список причин, по которым вы должны использовать grammY вместо Telegraf.

- grammY всегда поддерживает последнюю версию Bot API.
  Telegraf часто отстает на несколько версий.
- У grammY есть [документация](../).
  В Telegraf его нет --- она была заменена сгенерированным руководством по API, в котором нет пояснений, а те немногие руководства, которые существуют, являются неполными и их тяжело найти.
- grammY работает на TypeScript --- типы _просто работают_ и будут следовать за вашим кодом.
  В Telegraf вам часто придется писать код определенным образом, иначе он не скомпилируется (даже если на самом деле он будет работать нормально).
- grammY интегрирует подсказки из [официальной документации Bot API](https://core.telegram.org/bots/api) в строки, которые помогают вам во время написания кода.
  Telegraf не дает вам никаких пояснений к вашему коду.
- Ну и многое другое, например, более высокая производительность, большая экосистема плагинов, документация, переведенная для миллиардов людей, лучшая интеграция с базами данных и веб-фреймворками, лучшая совместимость с runtime'ом, расширение для [VS Code](https://marketplace.visualstudio.com/items?itemName=grammyjs.grammyjs) и ряд других вещей, которые вы обнаружите по мере продвижения.

Вот список причин, по которым вам стоит использовать Telegraf вместо grammY.

- У вас уже есть большой бот, написанный на Telegraf, и вы больше не работаете над ним.
  В этом случае переход на grammY может занять больше времени, чем вы сэкономите в долгосрочной перспективе, независимо от того, насколько плавным будет переход.
- Вы знаете Telegraf как свои пять пальцев и не заботитесь о том, чтобы менять свой набор навыков.
  grammY вводит ряд новых концепций, которые могут быть незнакомы, если вы пользовались только Telegraf, и использование grammY означает, что вы познакомитесь с новыми вещами.
- Есть несколько деталей, в которых Telegraf и grammY используют разный синтаксис для достижения одной и той же цели, а вы просто предпочитаете один стиль другому.
  Например, Telegraf использует `bot.on(message("text"))`, а grammY --- `bot.on("message:text")` для прослушивания текстовых сообщений.

### NTBA

Библиотека `node-telegram-bot-api` --- это второй большой проект, повлиявший на развитие grammY.
Его главное преимущество перед другими фреймворками заключается в том, что он до безобразия прост.
Его архитектуру можно описать в одном предложении, в то время как grammY для этого требуется [целый гайд](../guide/) на сайте документации.
Мы считаем, что все эти объяснения на сайте grammY помогают людям легко начать работу, но очень заманчиво иметь библиотеку, которая вообще не нуждается в объяснениях.

С другой стороны, это хорошо только в краткосрочной перспективе.
Идея поместить все в гигантский файл и использовать примитивный `EventEmitter` для обработки потоков сложных объектов (ака веб-запросов) принесла много боли в мир ботов Telegram, и это, безусловно, помешало реализовать ряд хороших идей.

Боты всегда начинают с малого, но ответственный фреймворк должен предоставлять им четкий путь для роста и масштабирования.
К сожалению, NTBA абсолютно не справляется с этой задачей.
Любой проект, содержащий более 50 строк и использующий NTBA, в итоге превращается в ужасный беспорядок, состоящий из перекрестных ссылок, похожих на спагетти.
Вы не хотите этого.

### Другие фреймворки

В настоящее время не существует других библиотек TypeScript, которые стоило бы использовать для создания ботов.
Всё, кроме grammY, Telegraf и NTBA, в основном не поддерживается и, следовательно, ужасно устарело.

Вы только что создали новую потрясающую библиотеку, а мы еще не знаем о ней?
Не стесняйтесь редактировать эту страницу и добавлять сравнения или расскажите нам о своем мнении в [групповом чате](https://t.me/grammyjs)!

## Сравнение с фреймворками на других языках программирования

Есть причины отдать предпочтение другому языку программирования, а не TypeScript.
Самое главное, чтобы вам нравилось работать с инструментами языка, который вы выбрали.
Если вы твердо решили остановиться на другом языке, то можете не читать дальше.

Если же вы все еще читаете, то, возможно, хотите узнать, почему grammY написан на TypeScript и почему вам тоже стоит подумать о том, чтобы выбрать этот язык для своего бота.

В этом разделе мы расскажем о том, как TypeScript имеет ряд преимуществ перед другими языками, когда речь идет о разработке ботов Telegram.
Это сравнение будет ограничено Python, Go и Rust.
Не стесняйтесь добавлять другие разделы, если вы хотите сравнить TypeScript с другим языком.

Некоторые из приведенных ниже пунктов частично основаны на личном мнении.
У людей разные вкусы, поэтому воспринимайте этот раздел с щепоткой соли.

### Фреймворки написанные на Python

Сравнивая TypeScript с Python, можно сделать однозначный вывод.
Выбирайте TypeScript, и вы получите удовольствие:

1. **Лучший инструментарий редактора.**
   Аннотации типов в grammY просто великолепны.
   Хотя Python и представил типы в релизе 3.5, они не используются в экосистеме так часто, как это происходит с JavaScript/TypeScript.
   Поэтому они не могут сравниться с тем, что вы получаете из коробки с grammY и сопутствующими библиотеками.
   С типами поставляется автодополнение на каждом этапе разработки, а также полезные всплывающие подсказки с пояснениями и ссылками.

2. **Легче масштабировать кодовую базу.**
   У системы типов есть и второе преимущество --- она позволяет масштабировать код вашего бота.
   Это гораздо сложнее сделать для проектов, написанных на языке с более плохой безопасностью типов.

3. **Легче масштабировать нагрузку.**
   Если ваш бот действительно начнет набирать популярность, то масштабировать ботов, написанных на JS, будет значительно проще, чем на Python.

4. **Более высокая отзывчивость вашего бота.**
   На данный момент движок V8 и его партнеры делают JavaScript самым быстрым в мире языком сценариев.
   Если вы хотите, чтобы ваш бот был максимально быстрым и при этом пользовался динамичным языком, то grammY --- ваш лучший выбор.

Как всегда, языки программирования отлично справляются с определенными задачами, а для других их следует избегать.
Этот язык не является исключением.

Например, при нынешнем состоянии экосистемы --- всё, что связано с машинным обучением, не должно выполняться на JavaScript.
Однако, когда речь идет о веб-серверах, TypeScript, как правило, является более хорошим выбором.

### Фреймворки написанные на Go

Если вы хорошо знаете TypeScript и [Go](https://go.dev/), то разумным критерием выбора языка для вашего бота будет баланс между скоростью разработки и скоростью выполнения.

Если вы не до конца уверены в том, что создаёте, то выбирайте grammY.
TypeScript позволяет выполнять итерации над проектом с невероятной скоростью.
Он отлично подходит для быстрого создания прототипов, тестирования новых вещей, знакомства с ботами и быстрого выполнения задач.
Как правило, обработка ~100.000.000 обновлений в день может быть легко выполнена с помощью TypeScript, но выход за эти рамки потребует дополнительной работы, например, использования еще одного плагина grammY.

Выбирайте библиотеку, написанную на Go, если вы уже достаточно хорошо знаете, что будете создавать (не ожидаете, что вам понадобится большая помощь), и уже знаете, что ваш бот будет обрабатывать очень большое количество обновлений.
Будучи нативно компилируемым языком, Go превосходит TypeScript по скорости работы процессора на несколько пунктов.
Это менее важно, когда вы пишете бота, потому что большая часть времени уходит на ожидание сети, но со временем начнет иметь значение, насколько быстро ваш бот может разбирать JSON.
В таких случаях Go может оказаться лучшим выбором.

Ещё одна метрика --- это опыт разработки (DX).
В целом, Go и Typescript известны крайне хорошими инструментами и поддержкой редакторов кода.
Однако, в частности для Bot API, grammY значительно лучше любой библиотеки, написанной на Go.
В основном это связано с развитой системой типов в Typescript, которую grammY использует изысканным образом.
В результате вы можете интерактивно изучать Bot API прямо из вашего редактора кода.
Это практически невозможно сделать в той же степени с помощью любой библиотеки, написанной на Go.
Если вы хотите получить лучший DX --- используйте grammY.

### Фреймворки написанные на Rust

Аналогичный тезис можно привести [как в случае с Go](#фреимворки-написанные-на-go), но в случае с [Rust](https://www.rust-lang.org/) он еще сильнее.
В некотором смысле, написание Rust займет у вас еще больше времени, но ваш бот будет еще быстрее.

Также обратите внимание, что использование Rust --- это весело, но редко необходимо для ботов.
Если вы хотите использовать Rust, то сделайте это, но подумайте о том, что вы любите Rust, а не о том, что это подходящий инструмент для работы.

## Как возразить такому сравнению?

Если вам кажется, что на этой странице что-то не так, не спешите злиться и защищать свой любимый язык или библиотеку!
Пожалуйста, сообщите нам об этом в [групповом чате](https://t.me/grammyjs)!
Мы будем рады, если вы расскажете нам о своей точке зрения.
Естественно, вы также можете просто отредактировать эту страницу на GitHub или создать [Issue](https://github.com/grammyjs/website/issues/new), чтобы указать на ошибки или предложить другие вещи.
Эта страница всегда будет иметь возможность стать более объективной и более справедливой.
