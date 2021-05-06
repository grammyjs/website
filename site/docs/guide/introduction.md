---
prev: /guide/
next: ./getting-started.md
---

# Introduction

A Telegram bot is a special user account that is automated by a program.
Anyone can create a Telegram bot, the only prerequisite is that you know a little bit of coding.

> If you already know how create bots, head over to [Getting Started](./getting-started.md)!

grammY is a library that makes it super simple to write such a bot.

## How to write a bot

Before you begin creating your bot, make yourself familiar with what Telegram bots can and cannot do.
Check out the [Introduction for Developers](https://core.telegram.org/bots) by the Telegram team.

In making your Telegram bot, you will create a text file with the source code of your bot (or copy one of our example files).
It defines _what your bot actually does_, i.e. “when a user sends this message, respond with that”, and so on.

You can then run that source file.
You bot is working now, until you stop your program again.

You're kinda done now …

## How to keep a bot running

> Skip this section if you only want to play around with bots, and [continue down here with the prerequisites](#prerequisites-to-getting-started) to getting started.

… except, if you are serious about your bot project, you're not.
If you stop your bot (or shut down your computer), your bot becomes unresponsive, so it will no longer react to any messages.

Simply put, if you want the bot to be online all the time, you have to keep a computer running 24 hours every day.
Because you most likely don't want to do that with your laptop, you should upload your code to a _hosting provider_ (in other words, someone else's computer, also known as _server_), and let those people run it for you.

There are countless companies that let you run your Telegram bot for free.
This documentation covers a number of different hosting providers that we know work well with grammY (check the Resources).
In the end, however, the choice of which provider to pick is up to you.
Remember that running your code somewhere else means that whoever owns that “somewhere” has access to all your messages and the data of your users, so you should pick a provider that you can trust.

Here is a (simplified) diagram of how the setup will look in the end when Alice contacts your bot:

```asciiart:no-line-numbers
_________        sends a         ____________                    ____________
| Alice | —> Telegram message —> | Telegram | —> HTTP request —> | your bot |
—————————      to your bot       ————————————                    ————————————

 a phone                        Telegram servers                  your laptop,
                                                                better: a server


|____________________________________________|                   |___________|
                    |                                                  |
        Telegram's responsibility                             your responsibility
```

<!-- TODO: create a proper diagram instead of the ASCII art -->

Similarly, your bot can make HTTP requests to the Telegram servers to send messages back to Alice.
(If you never heard of HTTP, you can think of it as the data packages that are sent through the internet for now.)

## What grammY does for you

Bots interact with Telegram via HTTP requests.
Everytime your bot sends or receives messages, HTTP requests go back and forth between the Telegram servers and your server/computer.

In its core, grammY implements all the communication things for you, so you can simply type `sendMessage` and a message will be sent.
In addition, there are a variety of other helpful things that grammY does to make it simpler to create your bot.
You will get to know them as you go.

## Prerequisites to getting started

> Skip the rest of this page if you already know how to develop a Node.js application, and [get started](./getting-started.md).

Here are a few interesting things about programming—things that are essential to coding yet rarely explained because the developers think they are self-evident.

In the next section, you will create a bot by writing a text file that contains source code in the programming language [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html).
The grammY documentation will not teach you how to program, so we expect you to teach yourself.
Remember, though: creating a Telegram bot with grammY is actually a good way to learn coding :rocket:

::: tip Learning how to code
You can start learning TypeScript with the [official tutorial](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) written by the TypeScript team, and then move on from there.
Don't spend more than 30 minutes reading things on the internet, then come back here, (read the rest of the section) and [get started](./getting-started.md).

If you see unfamiliar syntax in the docs, or if you get an error message that you don't understand, google it—the explanation is already on the internet (e.g. on StackOverflow).
:::

::: danger Not learning how to code
Save yourself some time by watching [this 34 second long video](https://youtu.be/8RtGlWmXGhA).
:::

Once you have a source file (e.g. called `bot.ts`), you are going to _compile_ it to JavaScript.
You will then have two files: your original `bot.ts`, and a generated `bot.js`, which can in turn be run.
The exact commands for all of that will be introduced in the next section when you actually create a bot, but it is important to know that these steps are necessary.

In order to run the `bot.js` file, you have to have [Node.js](https://nodejs.org/en/) installed.
Node.js is a software that can execute your code, hence making your bot run.
That's why Node.js is called a _runtime environment_.

**In summary:**

1. Create a source file `bot.ts` with TypeScript code, e.g. using [VSCode](https://code.visualstudio.com/) (or any other text editor).
2. Compile the code by typing a command into your terminal. This generates a file called `bot.js`.
3. Run `bot.js` using Node.js, again from your terminal.

Every time you modify your code in `bot.ts`, you have to repeat steps 2 and 3.

Are you ready? :robot:
