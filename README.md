# Documentation

[Documentation for grammY.](https://grammy.dev) Contributions are welcome!

The `logos/` directory only contains the logos of grammY, all website-related
things are in `site/`. The `grammydocsbot/` directory contains the code for
[@grammYdocsbot](https://t.me/grammYdocsbot).

## Building the Website Locally

Setup (once): `cd` into `site/` and run `npm install`.

You can now run

```bash
npm run docs:dev
```

to view the documentation in your browser.

## Checking correct formatting of docs

In addition to the VSCode extension that lints the Markdown,
[Deno](https://deno.land/) formatting is used to check the formatting of
markdown files and the TypeScript and JavaScript code contained in them. You can
use the following two commands.

```bash
# Checks if all files are fomatted correctly
deno fmt --config deno.json --check

# Automatically formats all files directly
deno fmt --config deno.json
```

In the `site/` directory, you can also run

```bash
npm run fmt
```

to perform the formatting. Note that you still need to have Deno installed.
