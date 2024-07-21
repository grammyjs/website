# Возможности Middleware

В руководстве мы представили [middleware](../guide/middleware) как стек функций.
Хотя нет ничего плохого в том, что вы можете использовать middleware таким линейным образом (также в grammY), называть его просто стеком --- это упрощение.

## Middleware в grammY

Обычно вы видите следующую схему.

```ts
const bot = new Bot("");

bot.use(/* ... */);
bot.use(/* ... */);

bot.on(/* ... */);
bot.on(/* ... */);
bot.on(/* ... */);

bot.start();
```

Выглядит как стек, только за кулисами --- это дерево.
Сердцем этой функциональности является класс `Composer` ([ссылка](/ref/core/composer)), который строит это дерево.

Прежде всего, каждый экземпляр `Bot` является экземпляром `Composer`.
Это просто подкласс, поэтому `class Bot extends Composer`.

Также вы должны знать, что каждый метод `Composer` внутренне вызывает `use`.
Например, `filter` просто вызывает `use` с некоторым middleware для ветвления, а `on` просто вызывает `filter` снова с некоторой предикатной функцией, которая сопоставляет обновления с заданным [фильтрующими запросами](../guide/filter-queries).
Поэтому мы можем пока ограничиться рассмотрением `use`, а остальное будет дальше.

Теперь нам предстоит немного углубиться в детали того, что `Composer` делает с вашими вызовами `use`, и чем он отличается от других систем middleware.
Разница может показаться тонкой, но дождитесь следующего подраздела, чтобы узнать, почему она имеет замечательные последствия.

## Расширение `Composer`

Вы можете установить дополнительный middleware на экземпляр `Composer` даже после установки самого `Composer` где-либо.

```ts
const bot = new Bot(""); // подкласс `Composer`

const composer = new Composer();
bot.use(composer);

// Они будут запущены:
composer.use(/* A */);
composer.use(/* B */);
composer.use(/* C */);
```

`A`, `B` и `C` будут запущены.
Все это говорит о том, что после установки экземпляра `Composer` вы все еще можете вызвать `use` на нем, и этот middleware все равно будет запущен.
(В этом нет ничего выдающегося, но это уже основное отличие от популярных конкурирующих фреймворков, которые просто игнорируют последующие операции).

Вам может быть интересно, где здесь древовидная структура.
Давайте посмотрим на этот фрагмент:

```ts
const composer = new Composer();

composer.use(/* A */);
composer.use(/* B */).use(/* C */);
composer.use(/* D */).use(/* E */).use(/* F */).use(/* G */);
composer.use(/* H */).use(/* I */);
composer.use(/* J */).use(/* K */).use(/* L */);
```

Вы видите это?

Как вы можете догадаться, все middleware будут запускаться в порядке от `A` до `L`.

Другие библиотеки внутренне сократили бы этот код, чтобы он был эквивалентен `composer.use(/* A */).use(/* B */).use(/* C */).use(/* D */)...` и так далее.
Напротив, grammY сохраняет указанное вами дерево: один корневой узел (`composer`) имеет пять дочерних (`A`, `B`, `D`, `H`, `J`), а дочерний `B` имеет еще один дочерний, `C`, и т.д.
Это дерево будет обходить каждое обновление в порядке возрастания глубины, таким образом, эффективно проходя от `A` до `L` в линейном порядке, что очень похоже на то, что вы знаете из других систем.

Это возможно благодаря созданию нового экземпляра `Composer` при каждом вызове `use`, который в свою очередь будет расширяться (как объяснялось выше).

## Конкатенация вызовов `use`

Если бы мы использовали только `use`, это было бы не слишком юзабельно (каламбур).
Все становится интереснее, как только в дело вступает, например, `filter`.

Посмотрите на это:

```ts
const composer = new Composer();

composer.filter(/* 1 */, /* A */).use(/* B */)

composer.filter(/* 2 */).use(/* C */, /* D */)
```

В строке 3 мы регистрируем `A` за предикатной функцией `1`.
`A` будет оцениваться только для обновлений, которые проходят условие `1`.
Однако `filter` возвращает экземпляр `Composer`, который мы дополняем вызовом `use` в строке 3, поэтому `B` все еще охраняется `1`, даже если он установлен в совершенно другом вызове `use`.

Строка 5 эквивалентна строке 3 в том отношении, что и `C`, и `D` будут запущены, только если `2` выполняется.

Помните, как вызовы `bot.on()` можно было объединять в цепочку, чтобы конкатенировать запросы фильтрации с помощью AND?
Представьте себе следующее:

```ts
const composer = new Composer();

composer.filter(/* 1 */).filter(/* 2 */).use(/* A */);
```

`2` будет проверяться только в том случае, если `1` выполняется, а `A` будет выполняться только в том случае, если `2` (и, следовательно, `1`) выполняется.

Пересмотрите раздел о [комбинировании фильтрующих запросов](../guide/filter-queries#комбинирование-нескольких-запросов) с новыми знаниями и почувствуйте свою новую силу.

Особым случаем здесь является `fork`, поскольку он запускает два параллельных вычисления, т.е. чередующихся в цикле событий.
Вместо того чтобы возвращать экземпляр `Composer`, созданный базовым вызовом `use`, он возвращает `Composer`, отражающий форк вычислений.
Это позволяет использовать лаконичные шаблоны типа `bot.fork().on(":text").use(/* A */)`.
Теперь `A` будет выполняться на ветке параллельных вычислений.