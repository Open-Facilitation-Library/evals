import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ignoredDirectories = new Set([".git", "node_modules"]);
const bareBranchReference =
  /(?<!\[)`(?:spec|feature|feat|fix|bugfix|hotfix|docs|chore|refactor|test|release)\/[^`\r\n]+`\s+branch\b/g;

async function findMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}

const root = process.cwd();
const failures = [];

for (const file of await findMarkdownFiles(root)) {
  const content = await readFile(file, "utf8");

  for (const match of content.matchAll(bareBranchReference)) {
    const line = content.slice(0, match.index).split("\n").length;
    failures.push(`${path.relative(root, file)}:${line}: ${match[0]}`);
  }
}

if (failures.length > 0) {
  console.error("Branch references in documentation must be clickable Markdown links:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Documentation branch references are clickable.");
}
