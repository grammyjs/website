# Comparison of Hosting Providers

There are many different hosting providers that allow you to run your bot.
It can sometimes be hard to keep track of how much they cost and how good their performance is.
This is why the grammY community is collecting their experiences on this page.

## What is a Hosting Provider?

In order to keep a bot online 24 hours a day, you need to run a computer 24 hours a day.
As [mentioned in the introduction](/guide/introduction.html#how-to-keep-a-bot-running), you most likely don't want to do that with your laptop or home computer.
Instead, you can ask a company to run the bot in the cloud.

In other words, you just run it on someone else's computer.

## Comparison Tables

> Please click the edit button at the bottom of the page to add more providers or to edit existing ones!

We have two comparison tables, one for [serverless](#what-does-serverless-mean) hosting and one for [VPS](#vps).

### Serverless

Serverless means that you do not control a single machine on which your bot is run.
Instead, these hosting providers will rather allow you to upload your code, and then start and stop different machines as necessary to make sure that your bot always works.

This has the downside that your bot does not have access to a persistent storage by default, such as a local file system.
Instead, you will often have to have a database separately and connect to it if you need to store data permanently.
We therefore recommend you to use a different kind of hosting for more complex bots, e.g. a [VPS](./vps.md).

The main thing to know about them is that you must run your bot on webhooks on serverless infrastructure.

| Name                  | Min. price | Pricing                               | Limits                                                                                             | Node.js            | Deno               | Web                | Notes                                |
| --------------------- | ---------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------ | ------------------ | ------------------ | ------------------------------------ |
| Vercel                | Free       | $20/mo subscription                   | [Unlimited invocations, 100 GB-hours, 10s time limit](https://vercel.com/pricing)                  | :question:         | :question:         | :question:         | Not intended for non-websites?       |
| Deta                  | Free       | No paid plans yet                     | No limits                                                                                          | :white_check_mark: | :question:         | :question:         |                                      |
| Scaleway Functions    | Free       | €0.15/1m req, €1.2 / 100k GB-s        | [1M requests, 400000 GB-s per month](https://www.scaleway.com/en/pricing/#serverless-functions)    | :question:         | :question:         | :question:         |                                      |
| Scaleway Containers   | Free       | €0.10 / 100k GB-s, €1.0 / 100k vCPU-s | [400000 GB-s, 200000 vCPU-s per month](https://www.scaleway.com/en/pricing/#serverless-containers) | :question:         | :question:         | :question:         |                                      |
| Deno Deploy           | Free       | No paid plans yet                     | [100k req/day, 1000 req/min, 50ms time limit](https://deno.com/deploy/docs/pricing-and-limits)     | :x:                | :white_check_mark: | :x:                | Beta                                 |
| Cloudflare Workers    | Free       | $5/10m req                            | [100k req/day, 10ms limit](https://workers.cloudflare.com/)                                        | :x:                | :x:                | :white_check_mark: |                                      |
| Vercel Edge Functions | Free       | $20/mo subscription for 500k          | [100k req/day](https://vercel.com/pricing)                                                         | :question:         | :question:         | :question:         |                                      |
| Heroku                | Free       | It's complicated                      | [550-1000 hours per month](https://www.heroku.com/pricing)                                         | :white_check_mark: | :question:         | :question:         | Long startup times, not recommended? |
| serverless.com        | Free       |                                       |                                                                                                    | :question:         | :question:         | :question:         |                                      |
| DigitalOcean Apps     | $5         |                                       |                                                                                                    | :question:         | :question:         | :question:         | Not tested                           |
| Fastly Compute@Edge   |            |                                       |                                                                                                    |                    |                    |                    |                                      |

### VPS

A virtual private server is a virtual machine that you have full control over.
You can usually access it via [SSH](https://en.wikipedia.org/wiki/Secure_Shell).
You can install any software there, and are responsible for system updates and so on.

You can run on bot on both polling or webhooks on a VPS.

Check out [the tutorial](./vps.md) on how to host a grammY bot on a VPS.

| Name          | Min. price | Ping to API                               | Cheapest option                 |
| ------------- | ---------- | ----------------------------------------- | ------------------------------- |
| DigitalOcean  | $5         | 1-15 ms :netherlands: AMS, 19 ms :de: FRA | 1 vCPU, 1GB RAM, 25GB SSD, 1TB  |
| Hetzner Cloud | €4.15      | ~42 ms :de:                               | 1 vCPU, 2GB RAM, 20GB SSD, 20TB |
| Scaleway      | €~7        |                                           | 2 cores, 2GB RAM, 20GB SSD      |
| Contabo       |            | 15 ms :de: Nuremberg                      |                                 |
| IONOS VPS     | €1/$2      | 15 ms :de: Baden-Baden                    | 1vCPU, 0.5GB RAM, 8GB SSD       |
