---
prev: ./flood.md
next: ./proxy.md
---

# Bot API Transformers

Middleware is a function that handles a context object, i.e. incoming data.

grammY also provides you with the inverse.
A _transformer function_ is a function that handles outgoing data, i.e.

- a method name of the Bot API to call, and
- a payload object that matches the method.

Instead of having `next` as the last argument to invoke downstream middleware, you receive `prev` as the first argument to utilize upstream transformer functions.
Looking at the type signature of `Transformer` ([grammY API Reference](https://doc.deno.land/https://deno.land/x/grammy/mod.ts/~/Transformer)), we can see how it reflects that.
Note that `Payload<M, R>` refers to the payload object that has to match the given method, and that `ApiResponse<ApiCallResult<M, R>>` is the return type of the invoked method.

The last invoked transformer function is a built-in caller that does things like JSON serialization of certain fields, and eventually calling `fetch`.

There is no equivalent of a `Composer` class for transformer functions because that’s probably overkill, but if you need it, you can write your own. PR welcome! :wink:

## Installing a Transformer Function

Transformer functions can be installed on `bot.api`.
Here is an example for a transformer function that does nothing:

```ts
// Pass-through transformer function
bot.api.config.use((prev, method, payload, signal) =>
  prev(method, payload, signal)
);

// Comparison with pass-through middleware
bot.use((ctx, next) => next());
```

Here is an example of a transformer function that prevents all API calls from happening:

```ts
// Incorrectly return undefined instead of the respective object types.
bot.api.config.use((prev, method, payload) => undefined as any);
```

You can also install transformer functions on the context object’s API object.
The transformer function will then only be used temporarily for the API requests that are performed on that specific context object.
Calls to `bot.api` are left unaffected.
Calls via context objects of concurrently running middleware are left unaffected, as well.
As soon as the respective middleware completes, the transformer function is discarded.

```ts
bot.on("message", (ctx) => {
  // Install on all context objects that process messages.
  ctx.api.config.use((prev, method, payload, signal) =>
    prev(method, payload, signal)
  );
});
```

> The `signal` parameter should be always passed to `prev`.
> It allows canceling requests and is important for `bot.stop` to work.

Transformer functions installed on `bot.api` will be pre-installed on every `ctx.api` object.
Thus, calls to `ctx.api` will be transformed by both those transformers on `ctx.api`, as well as those transformers installed on `bot.api`.

## Use Cases of Transformer Functions

Transformer functions are as flexible as middleware, and they have just as many different applications.

For instance, the [grammY menu plugin](/plugins/menu.md) installs a transformer function to turn outgoing menu instances into the correct payload.
You can also use them to

- implement [flood control](/plugins/transformer-throttler.md),
- mock API requests during testing,
- add [retry behavior](/plugins/auto-retry.md), or
- more.

Note, however, that retrying an API call can have odd side-effects: if you call `sendDocument` and pass a readable stream instance to `InputFile`, then the stream will be read the first time the request is tried.
If you invoke `prev` again, the stream may already be (partially) consumed, hence leading to broken files.
It is therefore a more reliable way to pass file paths to `InputFile`, so grammY can recreate the stream as necessary.

## API Flavoring

grammY features [context flavors](/guide/context.md#context-flavors) that can be used to adjust the context type.
This includes API methods—both those that are directly on the context object such as `ctx.reply`, and all methods in `ctx.api` and `ctx.api.raw`.
However, you cannot adjust the types of `bot.api` and `bot.api.raw` via context flavors.

This is why grammY supports _API flavors_.
They solve this problem:

```ts
import { Api, Bot, Context } from "grammy";
import { SomeApiFlavor, someContextFlavor, somePlugin } from "some-plugin";

// Context flavoring
type MyContext = Context & SomeContextFlavor;
// API flavoring
type MyApi = Api & SomeApiFlavor;

// Use both flavors.
const bot = new Bot<MyContext, MyApi>("my-token");

// Use a plugin.
bot.api.config.use(somePlugin());

// Now call `bot.api` with adjusted types from API flavor.
bot.api.somePluginMethod();

// Also, use adjusted context type from context flavor.
bot.on("message", (ctx) => ctx.api.somePluginMethod());
```

API flavors work exactly anaolgously to context flavors.
There are both additive and transformative API flavors, and multiple API flavors can be combined the same way as you would do with context flavors.
If you are unsure how this works, head back to [the section about context flavors](/guide/context.md#context-flavors) in the guide.
