---
prev: false
next: false
---

# Commands (`commands`)

Command handling on steroids.

This plugin provides various features related to command handling that are not contained in the [command handling done by the grammY core library](../guide/commands).
Here is a quick overview of what you get with this plugin:

- Better code structure by attaching middleware to command definitions
- Automatic synchronization via `setMyCommands`
- Defining command translations
- Command scope handling
- "Did you mean ...?" feature that automatically finds the nearest existing command

All of these features are made possible because you will define one or more central command structures that define your bot's commands.

## Basic Usage

todo simple example with no features

## Automatic Command Setting

todo how to make `setMyCommands` work

## Scoped Commands

todo command scopes from context

## Command Translations

todo localize commands

## Finding the Nearest Command

todo jaro winkler

## Plugin Summary

- Name: `commands`
- [Source](https://github.com/grammyjs/commands)
- [Reference](/ref/commands)
