# Introduction

A Telegram bot is a special user account that is automated by a program.
Anyone can create a Telegram bot, the only prerequisite is that you know a little bit of coding.

> If you already know how to create bots, head over to [Getting Started](./getting-started)!

grammY is a library that makes it super simple to write such a bot.

## How to Write a Bot

Before you begin creating your bot, make yourself familiar with what Telegram bots can and cannot do.
Check out the [Introduction for Developers](https://core.telegram.org/bots) by the Telegram team.

In making your Telegram bot, you will create a text file with the source code of your bot.
(You can also copy one of our example files.)
It defines _what your bot actually does_, i.e. "when a user sends this message, respond with that", and so on.

You can then run that source file.
Your bot will now work, until you stop running it.

You're kinda done now…

## How to Keep a Bot Running

…except, if you are serious about your bot project.
If you stop your bot (or shut down your computer), your bot becomes unresponsive, so it will no longer react to any messages.

> Skip this section if you only want to play around with bots, and [continue down here with the prerequisites](#prerequisites-to-getting-started) to getting started.

Simply put, if you want the bot to be online all the time, you have to keep a computer running 24 hours every day.
Because you most likely don't want to do that with your laptop, you should upload your code to a _hosting provider_ (in other words, someone else's computer, also known as a _server_), and let those people run it for you.

There are countless companies that let you run your Telegram bot for free.
This documentation covers a number of different hosting providers that we know work well with grammY (check the [Hosting](../hosting/comparison) section).
In the end, however, the choice of which provider to pick is up to you.
Remember that running your code somewhere else means that whoever owns that "somewhere" has access to all your messages and the data of your users, so you should pick a provider that you can trust.

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

Similarly, your bot can make HTTP requests to the Telegram servers to send messages back to Alice.
(If you have never heard of HTTP, you can think of it as the data packages that are sent through the internet, for now.)

## What grammY Does for You

Bots interact with Telegram via HTTP requests.
Every time your bot sends or receives messages, HTTP requests go back and forth between the Telegram servers and your server/computer.

At its core, grammY implements all of this communication for you, so you can simply type `sendMessage` in your code and a message will be sent.
In addition, there are a variety of other helpful things that grammY does to make it simpler to create your bot.
You will get to know them as you go.

## Prerequisites to Getting Started

> Skip the rest of this page if you already know how to develop a Deno or a Node.js application, and [get started](./getting-started).

Here are a few interesting things about programming---things that are essential to coding, yet rarely explained because most developers think they are self-evident.

In the next section, you will create a bot by writing a text file that contains source code in the programming language [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html).
The grammY documentation will not teach you how to program, so we expect you to teach yourself.
Remember, though: creating a Telegram bot with grammY is actually a good way to learn coding! :rocket:

::: tip Learning How to Code
You can start learning TypeScript with the [official tutorial](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) written by the TypeScript team, and then move on from there.
Don't spend more than 30 minutes reading things on the internet, then come back here, (read the rest of the section) and [get started](./getting-started).

If you see unfamiliar syntax in the docs, or if you get an error message that you don't understand, google it---the explanation is already on the internet (e.g. on Stack Overflow).
:::

::: danger Not Learning How to Code
Save yourself some time by watching this [34-second video](https://youtu.be/8RtGlWmXGhA).
:::

By picking grammY, you have already decided on a programming language, namely TypeScript.
But what happens once you've created your TypeScript code, how will it start running?
For that, you need to install some software which is able to _execute_ your code.
This type of software is called a _runtime environment_.
It takes in your source code files and actually does whatever is programmed in them.

For us, there are two runtime environments to choose from, [Deno](https://deno.com) and [Node.js](https://nodejs.org).
(If you see people call it _Node_, they are just too lazy to type ".js", but they mean the same thing.)

> The rest of this section helps you decide between these two platforms.
> If you already know what you want to use, jump down to the [prerequisites for Node.js](#prerequisites-for-node-js) or [those for Deno](#prerequisites-for-deno).

Node.js is the older, more mature technology.
If you need to connect to a funky database or do other low-level system-related things, chances are extremely high that you can do it with Node.js.
Deno is relatively new, so it is sometimes still lacking support for some advanced things.
Today, most servers use Node.js.

On the other hand side, Deno is significantly easier to learn and to use.
If you don't have much experience with programming yet, **it makes sense to start with Deno**.

Even if you have written code for Node.js before, you should consider giving Deno a go.
Many things that are hard under Node.js are a no-brainer under Deno.

Deno

- is much easier to install,
- does not require you to configure anything about your project,
- uses much less disk space,
- has superior, built-in development tools and great editor integration,
- is way more secure, and
- has many more advantages that do not fit here.

Developing code under Deno is also a lot more fun.
At least, that's our opinion.

However, if you have a reason to use Node.js, for example because you already know it well, then that is completely fine!
We are making sure that grammY works equally well on both platforms, and we are not cutting any corners.
Please choose what you think is best for you.

### Prerequisites for Deno

Before you can start creating your bot, let's first spend a few minutes on a proper setup for software development.
This means installing a few tools.

#### Preparing Your Machine for Development

[Install Deno](https://docs.deno.com/runtime/manual/getting_started/installation#download-and-install) if you have not done it already.

You also need a text editor that fits well with coding.
The best one for Deno is Visual Studio Code, often just called VS Code.
[Install it.](https://code.visualstudio.com)

Next, you need to connect VS Code and Deno.
That's very simple: There is an extension for VS Code that does everything automatically.
You can install it [as described here](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

Your system is now ready for bot development! :tada:

#### Developing a Bot

Create a new directory somewhere.
It will contain your bot project.
Open this new directory in VS Code.

```sh
mkdir ./my-bot
cd ./my-bot
code .
```

> If you’re on macOS and the `code` command is not available, just open VS Code, hit `Cmd+Shift+P`, type "shell command", and hit Enter.

In VS Code, turn this empty directory into a Deno project.
Hit `Ctrl+Shift+P`, type "deno init", and hit Enter.
The bottom right of your editor should then display the version of Deno installed on your system.

Your Deno development environment is ready.
You can now start writing your bot.
This is explained on the next page.

One last thing:
After you have created your bot, for example in a file called `bot.ts`, you can run it by typing `deno run --allow-net bot.ts` in your terminal.
(Yes, writing software means using the terminal a lot, get used to it.)
You can stop the bot again with `Ctrl+C`.

Ready?
[Get started](./getting-started#getting-started-on-deno)! :robot:

### Prerequisites for Node.js

You are going to write your bot in TypeScript, but, contrary to Deno, Node.js cannot actually run TypeScript.
Instead, once you have a source file (e.g. called `bot.ts`), you are going to _compile_ it to JavaScript.
You will then have two files: your original `bot.ts`, and a generated `bot.js`, which can in turn be run by Node.js.
The exact commands for all of that will be introduced in the next section when you actually create a bot, but it is important to know that these steps are necessary.

In order to run the `bot.js` file, you have to have [Node.js](https://nodejs.org/en/) installed.

In summary, this is what you have to do for Node.js:

1. Create a source file `bot.ts` with TypeScript code, e.g. using [VS Code](https://code.visualstudio.com/) (or any other code editor).
2. Compile the code by running a command in your terminal. This generates a file called `bot.js`.
3. Run `bot.js` using Node.js, again from your terminal.

Every time you modify your code in `bot.ts`, you need to restart the Node.js process.
Hit `Ctrl+C` in your terminal to stop the process.
This will stop your bot.
Then, you need to repeat steps 2 and 3.

::: tip Wait, what?
Installing Node.js and setting up and configuring everything correctly takes a lot of time.
If you have never done this before, you should expect to run into plenty of confusing problems that are hard to fix.

This is why we sort of expect that you know how to set up your system, or that you are able to teach yourself.
(Already installing Node.js _the right way_ is so complicated that it does not fit this page.)

If you feel lost at this point, you should leave Node.js behind and use [Deno](#prerequisites-for-deno) instead.
:::

Still confident?
Great!
[Get started](./getting-started#getting-started-on-node-js)! :robot:
