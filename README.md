# Documentation

[Documentation for grammY.](https://grammy.dev)
Contributions are welcome!

The `logos/` directory only contains the logos of grammY—all website-related things are in `site/`.

## [Contribution Guide »](./CONTRIBUTING.md)

## Building the Website Locally

Setup (once): `cd` into `site/` and run `npm install`.

You can now run

```sh
npm run docs:dev
```

to view the documentation in your browser.

## Checking Correct Formatting of Docs

In addition to the VS Code extension that lints the Markdown, [Deno](https://deno.com/) formatting is used to check the formatting of markdown files and the TypeScript and JavaScript code contained in them.
You can use the following two commands in the `site/` directory.

```sh
cd site/

# Checks if all files are formatted correctly
deno fmt --check

# Automatically formats all files directly
deno fmt
```

You can also run

```sh
npm run docs:fmt
```

in the `site/` directory to perform the formatting if you don't have Deno installed.
