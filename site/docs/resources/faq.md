# FAQ

## General

### When was grammY created?

The first publish of grammY code was in late March, 2021.

### How does grammY compare to other JavaScript bot frameworks?

It has a documentation.

Also, grammY learns from the experiences and mistakes of a rich ecosystem of Telegram bot frameworks, picks out the best ideas from several libraries, and develops them further.
grammY features also some original ideas that are not found anywhere else.

Naturally, this FAQ is biased.
With that out of the way, it is safe to say that there is hardly any reason to use another JavaScript bot framework over grammY when creating new bots.

### What if I like Python better?

First of all: that's fine.
The most important thing is that you like working with your tools and languages.

That being said, TypeScript has a few advantages over Python when it comes to developing Telegram bots.

1. **Better editor tooling.** The type annotations of grammY are outstanding.
   While Python did introduce types in its 3.5 release, they are not used as commonly in the ecosystem as it is the case with JavaScript/TypeScript.
   Hence, they cannot compare to what you get out of the box with grammY and its accompanying libraries.
   With the types come auto-completion at every step of development, as well as helpful tooltips with explanations and links.
2. **`async`/`await` support.** The largest bot framework for python, PTB, [announced its migration](https://telegram.me/pythontelegrambotchannel/94) to asynchronous programming in January 2021, which is expected to maybe take “2 years”. grammY is already there.
3. Again, the documentation is better for grammY than for PTB, even though the PTB team is doing a much better job than the rest of the JavaScript ecosystem with their libaries that preceded grammY.

The main advantage of PTB over grammY is the size of its community.
grammY is still a very young project, and even though we have a [small but friendly community chat](https://telegram.me/grammyjs), it cannot reach up to the impressive number of engaged users that PTB has.
