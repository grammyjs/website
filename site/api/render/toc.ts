export function createTableOfContents(
  docs: { name: string; ref: { name: string }[] },
) {
  return `# Index

${
    docs.ref.map((d) => `- [\`${d.name}\`](./${d.name}.md)`)
      .join("\n")
  }`;
}
