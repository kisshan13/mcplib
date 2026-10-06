import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { rmSync } from "node:fs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetDirectory = resolve(repositoryRoot, "standalone/example");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

rmSync(targetDirectory, { recursive: true, force: true });

execFileSync(pnpmCommand, ["run", "build"], {
  cwd: repositoryRoot,
  stdio: "inherit",
  shell: process.platform === "win32"
});

execFileSync(
  pnpmCommand,
  ["--filter=@apps/example", "--prod", "--legacy", "deploy", targetDirectory],
  {
    cwd: repositoryRoot,
    stdio: "inherit",
    shell: process.platform === "win32"
  }
);

console.log(`Standalone service created at ${targetDirectory}`);
