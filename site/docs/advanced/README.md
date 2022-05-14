---
next: ./middleware.html
---

# Overview: Advanced Topics

When your bot becomes more popular, you may run into more complex issues than just making your bot work at all.

This section of the docs will start out with a deep dive into [grammY's middleware system](./middleware.html), which will allow you to write more sophisticated message handling than commonly necessary.

The next four chapters care about scaling up.
Read [Part I](./structuring.html) if your code gets very complex.
Read [Part II](./scaling.html) if you have to process a lot of messages.
Read [Part III](./reliability.html) if you worry about the reliability of your bot.
Read [Part IV](./flood.html) if you are hitting rate limits, i.e. getting 429 errors.

If you need to intercept and transform API requests on the fly, grammY offers you to do this by installing [transformer functions](./transformers.html).

grammY also has [proxy support](./proxy.html).

Last but not least, we compiled a [list of a few things that you should keep in mind](./deployment.html) when deploying your bot.
There is nothing new in there, it's just a bunch of things about potential traps, all in a central place for you to go through.
Maybe it let's you sleep better at night.
