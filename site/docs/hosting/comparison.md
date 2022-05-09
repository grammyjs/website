# Comparison of Hosting Providers

There are many different hosting providers that allow you to run your bot.
It can sometimes be hard to keep track of how much they cost and how good their performance is.
This is why the grammY community is collecting their experiences on this page.

## What is a Hosting Provider?

In order to keep a bot online 24 hours a day, you need to run a computer 24 hours a day.
As [mentioned in the introduction](/guide/introduction.html#how-to-keep-a-bot-running), you most likely don't want to do that with your laptop or home computer.
Instead, you can ask a company to run the bot in the cloud.

In other words, you just run it on someone else's computer.

## Comparison Table

Please click the edit button at the bottom of the page to add more providers or to edit existing ones!

| Name                | Min. price | Serverless? | Ping and Location                    | Limits                                              | Features   |
| ------------------- | ---------- | ----------- | ------------------------------------ | --------------------------------------------------- | ---------- |
| Vercel              | Free       | Yes         |                                      | Unlimited invocations, 100 GB-hours, 10s time limit |            |
| Deta                | Free       | Yes         |                                      | No limits                                           |            |
| Scaleway Functions  | Free       | Yes         |                                      | 1M requests, 400000 GB-s per month                  |            |
| Scaleway Containers | Free       | Yes         |                                      | 400000 GB-s, 200000 vCPU-s per month                |            |
| Deno Deploy         | Free       | Yes         |                                      |                                                     |            |
| Cloudflare Workers  |            | Yes         |                                      |                                                     |            |
| Heroku              |            | Yes         |                                      |                                                     |            |
| DigitalOcean Apps   | $5         | Yes         |                                      |                                                     | Not tested |
| DigitalOcean        | $5         | No          | 1ms :netherlands: AMS, 19ms :de: FRA | 1 vCPU, 1GB RAM, 25GB SSD, 1TB                      |            |
| Hetzner Cloud       | €4.15      | No          | ~42ms :de:                           | 1 vCPU, 2GB RAM, 20GB SSD, 20TB                     |            |
| Scaleway            | ~7€        | No          |                                      | 2 cores, 2GB RAM, 20GB SSD                          |            |
| Contabo             |            | No          | 15ms :de:                            |                                                     |            |
| IONOS VPS           | €1/$2      | No          | 15ms :de: Baden-Baden                | 1vCPU, 0.5GB RAM, 8GB SSD                           |            |

## What Does Serverless Mean?

Serverless means that you do not control a single machine on which your bot is run.
Instead, these hosting providers will rather allow you to upload your code, and then start and stop different machines as necessary to make sure that your bot always works.

The main thing to know about them is that you must run your bot on webhooks on serverless infrastructure.
