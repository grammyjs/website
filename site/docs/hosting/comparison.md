# Comparison of Hosting Providers

There are many different hosting providers that allow you to run your bot.
It can sometimes be hard to keep track of how much they cost and how good their performance is.
This is why the grammY community is collecting their experiences on this page.

## What is a Hosting Provider?

In order to keep a bot online 24 hours a day, you need to run a computer 24 hours a day.
As [mentioned in the introduction](../guide/introduction.html#how-to-keep-a-bot-running), you most likely don't want to do that with your laptop or home computer.
Instead, you can ask a company to run the bot in the cloud.

In other words, you just run it on someone else's computer.

## Comparison Tables

> Please click the edit button at the bottom of the page to add more providers or to edit existing ones!

We have two comparison tables, one for [serverless](#serverless) hosting and one for [VPS](#vps).

### Serverless

Serverless means that you do not control a single machine on which your bot is run.
Instead, these hosting providers will rather allow you to upload your code, and then start and stop different machines as necessary to make sure that your bot always works.

This has the downside that your bot does not have access to a persistent storage by default, such as a local file system.
Instead, you will often have to have a database separately and connect to it if you need to store data permanently.
We therefore recommend you to use a different kind of hosting for more complex bots, e.g. a [VPS](./vps.md).

The main thing to know about them is that on serverless infrastructures you are required to use webhooks.

| Name                   | Min. price | Pricing                                                                  | Limits                                                                                  | Node.js | Deno                        | Web | Notes                          |
| ---------------------- | ---------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------- | --------------------------- | --- | ------------------------------ |
| Deta                   | Free       | No paid plans yet                                                        | No specific limits                                                                      | ✅       | ❓                           | ❓   |                                |
| Deno Deploy            | Free       | $10/mo subscription for 5M req and 100 GB; $2/1M req, $0.3/GB network    | [100K req/day, 100 GB/mo, 10 ms CPU-time limit](https://deno.com/deploy/pricing)        | ❌       | ✅                           | ❌   |                                |
| Fly                    | Free       | $1.94/mo subscription for shared-cpu-1x and 256 MB RAM, $0.02/GB network | [3 shared-cpu-1x 256mb VMs, 160GB/mo, 3GB storage](https://fly.io/docs/about/pricing/)  | ✅       | ✅                           | ❓   |                                |
| DigitalOcean Functions | Free       | $1.85/100K GB-s                                                          | [90K GB-s/mo](https://docs.digitalocean.com/products/functions/details/pricing/)        | ✅       | ❌                           | ❓   |                                |
| Cloudflare Workers     | Free       | $5/10M req                                                               | [100K req/day, 10 ms CPU-time limit](https://workers.cloudflare.com/)                   | ❌       | [✅](https://denoflare.dev/) | ✅   |                                |
| Heroku                 | Free       | It's complicated                                                         | [550-1000 h/mo](https://www.heroku.com/pricing)                                         | ✅       | ❓                           | ❓   |                                |
| Vercel                 | Free       | $20/mo subscription                                                      | [Unlimited invocations, 100 GB-h, 10 s time limit](https://vercel.com/pricing)          | ❓       | ❓                           | ❓   | Not intended for non-websites? |
| Scaleway Functions     | Free       | €0.15/1M req, €1.2/100K GB-s                                             | [1M requests, 400K GB-s/mo](https://www.scaleway.com/en/pricing/#serverless-functions)  | ❓       | ❓                           | ❓   |                                |
| Scaleway Containers    | Free       | €0.10/100K GB-s, €1.0/100K vCPU-s                                        | [400K GB-s, 200K vCPU-s/mo](https://www.scaleway.com/en/pricing/#serverless-containers) | ❓       | ❓                           | ❓   |                                |
| Vercel Edge Functions  | Free       | $20/mo subscription for 500K                                             | [100K req/day](https://vercel.com/pricing)                                              | ❓       | ❓                           | ❓   |                                |
| serverless.com         | Free       |                                                                          |                                                                                         | ❓       | ❓                           | ❓   |                                |
| DigitalOcean Apps      | $5         |                                                                          |                                                                                         | ❓       | ❓                           | ❓   | Not tested                     |
| Fastly Compute@Edge    |            |                                                                          |                                                                                         | ❓       | ❓                           | ❓   |                                |

### VPS

A virtual private server is a virtual machine that you have full control over.
You can usually access it via [SSH](https://en.wikipedia.org/wiki/Secure_Shell).
You can install any software there, and you are responsible for system upgrades and so on.

On a VPS, you can run bots using both polling or webhooks.

Check out the [tutorial](./vps.md) on how to host grammY bots on a VPS.

| Name          | Min. price | Ping to Bot API                           | Cheapest option                    |
| ------------- | ---------- | ----------------------------------------- | ---------------------------------- |
| Contabo       |            | 15 ms :de: Nuremberg                      |                                    |
| DigitalOcean  | $5         | 1-15 ms :netherlands: AMS, 19 ms :de: FRA | 1 vCPU, 1 GB RAM, 25 GB SSD, 1 TB  |
| Hetzner Cloud | €4.15      | ~42 ms :de:                               | 1 vCPU, 2 GB RAM, 20 GB SSD, 20 TB |
| IONOS VPS     | €1 or $2   | 15 ms :de: Baden-Baden                    | 1 vCPU, 0.5 GB RAM, 8 GB SSD       |
| Scaleway      | €~7        |                                           | 2 cores, 2 GB RAM, 20 GB SSD       |

## Unit Explanations

### Base Units

| Unit | In Words    | Explanation                                               |
| ---- | ----------- | --------------------------------------------------------- |
| K    | thousand    | 1,000 of something.                                       |
| M    | million     | 1,000,000 of something.                                   |
| €    | Euro        | The currency EUR.                                         |
| $    | US-Dollar   | The currency USD.                                         |
| req  | request     | Number of HTTP requests.                                  |
| vCPU | virtual CPU | Computing power of one virtual CPU, a part of a real CPU. |
| ms   | millisecond | 0.001 seconds.                                            |
| s    | second      | One second (SI unit for time).                            |
| min  | minute      | One minute, 60 seconds.                                   |
| h    | hours       | One hour, 60 minutes.                                     |
| day  | day         | One day, 24 hours.                                        |
| mo   | month       | One month, approximately 30 days.                         |
| GB   | gigabytes   | 1,000,000,000 bytes of storage.                           |

### Example Unit Combinations

| Unit        | Quantity                 | In Words                               | Explanation                                              |
| ----------- | ------------------------ | -------------------------------------- | -------------------------------------------------------- |
| $/mo        | cost                     | US-Dollars per month                   | Monthly cost.                                            |
| €/M req     | cost                     | Euros per million requests             | Cost for handling one million request.                   |
| req/min     | throughput               | requests per minute                    | Number of requests handled in one minute.                |
| GB/s        | throughput               | gigabytes per second                   | Number of gigabytes transferred in one second.           |
| GB-s        | memory usage             | gigabyte seconds                       | One gigabyte used for one second.                        |
| GB-h        | memory usage             | gigabyte hours                         | One gigabyte used for one hour.                          |
| h/mo        | time fraction            | hours per month                        | Number of hours in one month.                            |
| K vCPU-s/mo | processing time fraction | thousand virtual CPU seconds per month | Monthly seconds of processing time with one virtual CPU. |
