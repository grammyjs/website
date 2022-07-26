---
next: ./middleware.md
---

# Overview: Advanced Topics

When your bot becomes more popular, you may run into more complex issues than just making your bot work at all.

This section of the docs will start out with a deep dive into [grammY's middleware system](./middleware.md), which will allow you to write more sophisticated message handling than commonly necessary.

The next four chapters care about scaling up.
Read [Part I](./structuring.md) if your code gets very complex.
Read [Part II](./scaling.md) if you have to process a lot of messages.
Read [Part III](./reliability.md) if you worry about the reliability of your bot.
Read [Part IV](./flood.md) if you are hitting rate limits, i.e., getting 429 errors.

If you need to intercept and transform API requests on the fly, grammY offers you to do this by installing [transformer functions](./transformers.md).

grammY also has [proxy support](./proxy.md).

Last but not least, we compiled a [list of a few things that you should keep in mind](./deployment.md) when deploying your bot.
There is nothing new in there.
It's just a bunch of things about potential traps, all in a central place for you to go through.
Maybe it let's you sleep better at night.
