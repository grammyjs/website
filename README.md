# Documentation

[Documentation for grammY.](https://grammy.dev)
Contributions are welcome!

The `logos/` directory only contains the logos of grammY—all website-related things are in `site/`.

## [Contribution Guide »](./CONTRIBUTING.md)

## Building the Website Locally

Make sure you have [Deno](https://deno.com) installed.

Setup (once): `cd` into `site/` and run `deno install --allow-scripts` followed by `deno task setup`.

You can now run

```sh
deno task docs:dev
```

to view the documentation in your browser.

## Checking Correct Formatting of Docs

In addition to the VS Code extension that lints the Markdown, [Deno](https://deno.com/runtime) formatting is used to check the formatting of markdown files and the TypeScript and JavaScript code contained in them.
You can use the following two commands in the `site/` directory.

```sh
cd site/

# Checks if all files are formatted correctly
deno fmt --check

# Automatically formats all files directly
deno fmt
```
