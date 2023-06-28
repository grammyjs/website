---
prev: ./deployment-types.md
---

# Telegram Payments

## Introduction

Bot Payments API is a free and open platform that allows bots to accept payments from Telegram users. You can send order checks for users in any chat room, be it a group or a channel. You can see a full list of features [here](https://core.telegram.org/bots/payments#introducing-payments-2-0). It is also worth noting that Telegram has **no access** to card data in any way and does **not** charge a fee for payments and uses payment providers, more on this below.

::: warning Compatibility with devices
To access **Payments 2.0**, users must have **Telegram 7.7** or higher. For the desktop version, it must be **2.7.2** or higher.

Outdated _mobile_ apps released after May 2017 only support basic chat payments with bots.
:::

## Prerequisites

To get started and understand how payments work in Telegram, you need to choose a payment provider from [this](https://core.telegram.org/bots/payments#supported-payment-providers) list.

**Payment Provider** - this is a company that offers online services for merchants and banks to facilitate electronic payments, including smart cards, bank payments like direct debits, and other banking transactions.

Choosing a payment provider can be challenging as they often require detailed information about you and your project, and they charge a percentage of each payment based on that. Telegram, as mentioned before, does not charge any commission for payments.

Once you've selected a payment provider, go to [@BotFather](https://t.me/BotFather), choose your desired bot, click on the **Payments** button, and select your prefer provider.

After you click, you will see two buttons:

- **Connect <payment_provider> Test**. Connecting usually takes some seconds. You'll receive a payment token that you can use for development. These tokens are in the format `12345:TEST:12345abcd`.

- **Connect <payment_provider> Live**. Clicking on this button will redirect you to the official provider bot. There, you'll need to complete basic verification and submit all the necessary documents for further consideration. Live tokens have the format `12345:LIVE:12345abcd`.
