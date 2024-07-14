---
prev: false
next: false
---

# 托管服务商的对比

在互联网上有许多不同的托管服务商，能够运行你的 bot。
但有时候很难跟踪它们的成本和性能。
这就是为什么 grammY 社区在这个页面收集并分享他们的经验。

## 什么是托管服务商？

为了每天 24 小时保持 bot 在线，你需要每天 24 小时运行一台电脑。
正如 [介绍中提到的](../guide/introduction#如何保持-bot-的运行)，你很可能不想在你的笔记本或家用电脑上做这件事。
相反，你可以请求一家公司来在云端运行你的 bot。

换句话说，你只是在别人的电脑上运行它。

## 对比表格

> 请点击页面底部的编辑按钮来添加更多提供商或编辑现有的提供商！

我们有两个对比表格：一个是 [serverless 托管和 PaaS](#serverless-和-paas)，一个是 [VPS](#vps) 托管。

### Serverless 和 PaaS

Serverless 意味着你不控制运行 bot 的单个机器。
相反，这些托管服务商会允许你上传你的代码，然后根据需要启动和停止不同的机器，以保证你的 bot 始终工作。

你需要知道的是，在 serverless 基础设施下，你必须使用 [webhooks](../guide/deployment-types)。
当你尝试通过轮询（`bot.start()` 或 [grammY runner](../plugins/runner)）运行 bot 时，下面的大多数服务商都会遇到问题。

另一方面，PaaS（Platform as a Service）提供了类似但更可控的解决方案。
你可以选择有多少机器实例将为你的 bot 服务，以及它们何时运行。
如果你选择的服务商允许你的单个实例始终保持运行，那么 [polling](../guide/deployment-types) 也可以用于 PaaS。

Serverless 和 PaaS 有一个缺点，默认情况下不会为你提供持久存储，例如本地文件系统。
相反，如果你需要永久存储数据，你通常必须单独拥有一个数据库并连接到它。

| 名字                   | 最低价格 | 价格                                                                                                         | 限制                                                                                                              | Node.js                                                                                  | Deno                                           | Web                                               | 备注                                                                                                                                            |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Deta                   | 免费     | 暂时没有付费计划                                                                                             | 没有特别的限制                                                                                                    | ✅                                                                                       | ✅                                             | ✅                                                | Deno 由 [自定义应用](https://deta.space/docs/en/build/quick-starts/custom) 支持 ([示例](https://github.com/deta/starters/tree/main/deno-app))。 |
| Deno Deploy            | 免费     | $20/月，包含 5M req 和 100 GB 网络流量；$2/1M req, $0.5/GB 网络流量                                          | [1M req/mo, 100 GB/mo, 10ms CPU 时间限制](https://deno.com/deploy/pricing)                                        | ❌                                                                                       | ✅                                             | ❌                                                |                                                                                                                                                 |
| Fly                    | 免费     | $1.94/月订阅，包含一个共享 CPU 和 256 MB 内存, $0.02/GB 网络流量                                             | [3 shared-cpu-1x 256MB VMs, 160GB/mo, 3GB 存储](https://fly.io/docs/about/pricing/)                               | ✅                                                                                       | ✅                                             | ❓                                                |                                                                                                                                                 |
| DigitalOcean Functions | 免费     | $1.85/100K GB-s                                                                                              | [90K GB-s/mo](https://docs.digitalocean.com/products/functions/details/pricing/)                                  | ✅                                                                                       | ❌                                             | ❓                                                |                                                                                                                                                 |
| Cloudflare Workers     | 免费     | $5/10M req                                                                                                   | [100K req/day, 10ms CPU 时间限制](https://workers.cloudflare.com/)                                                | ❌                                                                                       | [✅](https://denoflare.dev/)                   | ✅                                                |                                                                                                                                                 |
| Vercel                 | 免费     | $20/月的订阅                                                                                                 | [无限次调用, 100 GB-h, 10s 时间限制](https://vercel.com/pricing)                                                  | [✅](https://vercel.com/docs/functions/runtimes/node-js)                                 | [✅](https://github.com/vercel-community/deno) | [✅](https://vercel.com/docs/frameworks)          | 不适用于非网站建设？                                                                                                                            |
| Scaleway Functions     | 免费     | €0.15/1M req, €1.2/100K GB-s                                                                                 | [1M req, 400K GB-s/mo](https://www.scaleway.com/en/pricing/?tags=serverless-functions-serverlessfunctions)        | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                 |
| Scaleway Containers    | 免费     | €0.10/100K GB-s, €1.0/100K vCPU-s                                                                            | [400K GB-s, 200K vCPU-s/mo](https://www.scaleway.com/en/pricing/?tags=serverless-containers-serverlesscontainers) | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                 |
| Vercel Edge Functions  | 免费     | $20/月的订阅, 包含 500K 请求                                                                                 | [100K req/day](https://vercel.com/pricing)                                                                        | [✅](https://vercel.com/docs/functions/runtimes/edge-runtime#compatible-node.js-modules) | ❓                                             | [✅](https://vercel.com/templates/edge-functions) |                                                                                                                                                 |
| serverless.com         | 免费     |                                                                                                              |                                                                                                                   | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                 |
| Heroku                 | $5       | $5，包含 1,000 [dyno hours](https://devcenter.heroku.com/articles/usage-and-billing#dyno-usage-and-costs)/mo | [512MB RAM, 30分钟不活跃后休眠](https://www.heroku.com/pricing)                                                   | ✅                                                                                       | ✅                                             | ❓                                                | Deno 由 [第三方构建包](https://github.com/chibat/heroku-buildpack-deno) 支持。                                                                  |
| DigitalOcean Apps      | $5       |                                                                                                              |                                                                                                                   | ❓                                                                                       | ❓                                             | ❓                                                | 未测试                                                                                                                                          |
| Fastly Compute@Edge    |          |                                                                                                              |                                                                                                                   | ❓                                                                                       | ❓                                             | ❓                                                |                                                                                                                                                 |
| Zeabur                 | $5       | $5/mo 订阅                                                                                                   |                                                                                                                   |                                                                                          |                                                |                                                   |                                                                                                                                                 |

### VPS

虚拟私人服务器是一个你拥有完全控制权限的虚拟机器。
你通常可以通过 [SSH](https://en.wikipedia.org/wiki/Secure_Shell) 访问它。
你可以在里面安装任何软件，并且由你自己负责系统升级和其他事情。

在 VPS 上，你可以使用轮询或者 webhooks 来运行 bot。

请查看 [教程](./vps) 来了解如何在 VPS 上运行 grammY bot。

| 名字          | 最低价格 | 到 Bot API 的延迟                         | 最便宜的方案                       |
| ------------- | -------- | ----------------------------------------- | ---------------------------------- |
| Hostinger     | $14      |                                           | 1 vCPU, 4 GB RAM, 50 GB SSD, 1 TB  |
| Contabo       |          | 15 ms :de: Nuremberg                      |                                    |
| DigitalOcean  | $5       | 1-15 ms :netherlands: AMS, 19 ms :de: FRA | 1 vCPU, 1 GB RAM, 25 GB SSD, 1 TB  |
| Hetzner Cloud | €4.15    | ~42 ms :de:                               | 1 vCPU, 2 GB RAM, 20 GB SSD, 20 TB |
| IONOS VPS     | €1 or $2 | 15 ms :de: Baden-Baden                    | 1 vCPU, 0.5 GB RAM, 8 GB SSD       |
| Scaleway      | €~7      |                                           | 2 cores, 2 GB RAM, 20 GB SSD       |
| MVPS          | €4       | 6-9 ms :de: 德国                          | 1 core, 2 GB RAM, 25 GB SSD, 2 TB  |

## 单位解释

### 基本单位

| 单位 | 文字化表达 | 解释                                         |
| ---- | ---------- | -------------------------------------------- |
| K    | 千         | 1,000 个 X 东西。                            |
| M    | 百万       | 1,000,000 个 X 东西。                        |
| €    | 欧元       | 货币欧元。                                   |
| $    | 美元       | 货币美元。                                   |
| req  | 请求       | HTTP 请求的数量。                            |
| vCPU | 虚拟 CPU   | 一个虚拟 CPU 的计算能力，是真实 CPU 的一部分 |
| ms   | 毫秒       | 0.001 秒。                                   |
| s    | 秒         | 1 秒 (时间的国际单位).                       |
| min  | 分钟       | 1 分钟，60 秒。                              |
| h    | 小时       | 1小时，60分钟。                              |
| day  | 天         | 1 天，24 小时。                              |
| mo   | 月         | 1 个月，大概 30 天。                         |
| GB   | 千兆字节   | 1,000,000,000 字节的储存量。                 |

### 单位组合示例

| 单位        | 数量         | 文字化表达              | 解释                                |
| ----------- | ------------ | ----------------------- | ----------------------------------- |
| $/mo        | 费用         | 每月美元数              | 每月费用。                          |
| €/M req     | 费用         | 每百万次请求欧元数      | 处理 100 万次请求的费用。           |
| req/min     | 吞吐量       | 每分钟请求数            | 1 分钟内处理的请求数。              |
| GB/s        | 吞吐量       | 每秒千兆字节            | 1 秒内传输的千兆字节数。            |
| GB-s        | 内存用量     | 千兆字节秒              | 1 秒钟能使用的千兆字节数。          |
| GB-h        | 内存用量     | 千兆字节小时            | 1 小时能使用的千兆字节数。          |
| h/mo        | 时间分量     | 每月小时数              | 一个月内的小时数。                  |
| K vCPU-s/mo | 处理时间分量 | 每月 1000 次虚拟CPU秒数 | 每月用一个虚拟 CPU 的处理时间的秒数 |
