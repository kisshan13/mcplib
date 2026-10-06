import { build } from "esbuild";
import { resolve } from "node:path";

const projectRoot = process.cwd();

await build({
  absWorkingDir: projectRoot,
  entryPoints: ["src/**/*.ts"],
  outdir: "build",
  bundle: false,
  format: "esm",
  platform: "node",
  sourcemap: true,
  tsconfig: resolve(projectRoot, "tsconfig.json")
});
